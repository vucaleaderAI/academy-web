'use client';

import React, { useState } from 'react';
import { usePdfStore, PdfPage } from '@/store/pdfStore';
import {
    Download,
    Trash2,
    CheckSquare,
    Square,
    FileType,
    Maximize,
    Settings,
    Loader2,
    Image as ImageIcon
} from 'lucide-react';
import { PDFDocument, PageSizes, degrees } from 'pdf-lib';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { cn } from '@/lib/utils';

export default function PdfSidebar() {
    const { pages, selectedPageIds, selectAll, deselectAll, removeSelectedPages, clearAll } = usePdfStore();

    // Settings State
    const [format, setFormat] = useState<'pdf' | 'img'>('pdf');
    const [pageSize, setPageSize] = useState<'a4' | 'a3' | '16:9' | '9:16' | 'original'>('a4');
    const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
    const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');
    const [isExporting, setIsExporting] = useState(false);

    // Helpers
    const getPageSize = (size: string, orient: 'portrait' | 'landscape') => {
        let width, height;
        switch (size) {
            case 'a4': [width, height] = PageSizes.A4; break;
            case 'a3': [width, height] = PageSizes.A3; break;
            case '16:9': width = 841.89; height = 473.56; break;
            case '9:16': width = 473.56; height = 841.89; break;
            default: [width, height] = PageSizes.A4;
        }
        return orient === 'landscape' ? [Math.max(width, height), Math.min(width, height)] : [Math.min(width, height), Math.max(width, height)];
    };

    const getQualityScale = (q: string) => {
        switch (q) {
            case 'low': return 0.5;
            case 'medium': return 0.8;
            case 'high': return 1.0;
            default: return 0.8;
        }
    };

    const handleExport = async () => {
        if (pages.length === 0) return;
        setIsExporting(true);

        try {
            const targets = selectedPageIds.size > 0
                ? pages.filter(p => selectedPageIds.has(p.id))
                : pages;

            // Sort by current index
            const sortedPages = [...targets].sort((a, b) => pages.indexOf(a) - pages.indexOf(b));
            const fileName = `merged_${Date.now()}`;

            if (format === 'pdf') {
                const mergedPdf = await PDFDocument.create();

                for (const page of sortedPages) {
                    if (page.fileId.startsWith('image-')) {
                        const imageBytes = await fetch(page.imageSrc).then(res => res.arrayBuffer());
                        let image;
                        if (page.imageSrc.includes('image/png')) {
                            image = await mergedPdf.embedPng(imageBytes);
                        } else {
                            image = await mergedPdf.embedJpg(imageBytes);
                        }

                        let [width, height] = pageSize === 'original'
                            ? [image.width, image.height]
                            : getPageSize(pageSize, orientation);

                        const pageDim = mergedPdf.addPage([width, height]);
                        const imgDims = image.scaleToFit(width, height);
                        const x = (width - imgDims.width) / 2;
                        const y = (height - imgDims.height) / 2;

                        pageDim.drawImage(image, {
                            x,
                            y,
                            width: imgDims.width,
                            height: imgDims.height,
                            rotate: degrees(page.rotation || 0),
                        });
                    } else {
                        const existingPdfBytes = await fetch(URL.createObjectURL(page.originalFile)).then(res => res.arrayBuffer());
                        const sourcePdf = await PDFDocument.load(existingPdfBytes);
                        const [copiedPage] = await mergedPdf.copyPages(sourcePdf, [page.pageIndex]);
                        copiedPage.setRotation(degrees(page.rotation || 0));
                        mergedPdf.addPage(copiedPage);
                    }
                }

                const pdfBytes = await mergedPdf.save();
                const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
                await saveFile(blob, `${fileName}.pdf`);
            } else {
                // Stitching Logic
                const images = await Promise.all(sortedPages.map(async (page) => {
                    const img = new Image();
                    img.src = page.imageSrc;
                    await new Promise(resolve => img.onload = resolve);
                    return img;
                }));

                const maxWidth = Math.max(...images.map(i => i.width));
                const totalHeight = images.reduce((sum, i) => sum + i.height, 0);

                const canvas = document.createElement('canvas');
                canvas.width = maxWidth;
                canvas.height = totalHeight;
                const ctx = canvas.getContext('2d');

                if (ctx) {
                    let currentY = 0;
                    for (const img of images) {
                        ctx.drawImage(img, 0, currentY);
                        currentY += img.height;
                    }

                    canvas.toBlob(async (blob) => {
                        if (blob) {
                            await saveFile(blob, `${fileName}.png`);
                        }
                    }, 'image/png');
                }
            }
        } catch (error) {
            console.error('Export failed', error);
            alert('파일 내보내기 중 오류가 발생했습니다.');
        } finally {
            setIsExporting(false);
        }
    };

    const saveFile = async (blob: Blob, fileName: string) => {
        if ('showSaveFilePicker' in window) {
            try {
                const handle = await (window as any).showSaveFilePicker({
                    suggestedName: fileName,
                    types: [{
                        description: 'Merged File',
                        accept: { [blob.type]: [`.${fileName.split('.').pop()}`] },
                    }],
                });
                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();
                return;
            } catch (err: any) {
                if (err.name !== 'AbortError') saveAs(blob, fileName);
            }
        } else {
            saveAs(blob, fileName);
        }
    };





    return (
        <div className="w-80 bg-white border-l border-slate-200 p-6 flex flex-col h-full overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-500" />
                설정 및 내보내기
            </h2>

            {/* Selection Actions */}
            <div className="mb-8">
                <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">페이지 선택</h3>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={selectAll}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
                    >
                        <CheckSquare className="w-4 h-4 text-indigo-500" />
                        전체 선택 ({pages.length})
                    </button>
                    <button
                        onClick={deselectAll}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
                    >
                        <Square className="w-4 h-4 text-slate-400" />
                        선택 해제
                    </button>
                    <button
                        onClick={() => {
                            if (confirm('선택한 페이지를 삭제하시겠습니까?')) removeSelectedPages();
                        }}
                        disabled={selectedPageIds.size === 0}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Trash2 className="w-4 h-4" />
                        선택 삭제 ({selectedPageIds.size})
                    </button>
                </div>
            </div>

            <div className="h-px bg-slate-100 mb-8" />

            {/* Export Settings */}
            <div className="mb-8 space-y-6">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">내보내기 설정</h3>

                {/* Format */}
                <div>
                    <label className="text-xs font-medium text-slate-700 mb-1.5 block">파일 형식</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setFormat('pdf')}
                            className={cn(
                                "flex flex-col items-center justify-center p-3 rounded-xl border transition-all",
                                format === 'pdf' ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500" : "border-slate-200 hover:bg-slate-50 text-slate-600"
                            )}
                        >
                            <FileType className="w-5 h-5 mb-1" />
                            <span className="text-xs font-medium">PDF 병합</span>
                        </button>
                        <button
                            onClick={() => setFormat('img')}
                            className={cn(
                                "flex flex-col items-center justify-center p-3 rounded-xl border transition-all",
                                format === 'img' ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500" : "border-slate-200 hover:bg-slate-50 text-slate-600"
                            )}
                        >
                            <ImageIcon className="w-5 h-5 mb-1" />
                            <span className="text-xs font-medium">이미지 병합</span>
                        </button>
                    </div>
                </div>

                {/* Page Size & Orientation Presets */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700">용지 설정</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => { setPageSize('a4'); setOrientation('portrait'); }}
                            className={cn(
                                "px-3 py-2 rounded-lg text-sm font-medium border transition-colors flex items-center justify-center gap-2",
                                pageSize === 'a4' && orientation === 'portrait'
                                    ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                                    : "bg-white border-slate-200 text-slate-600 hover:border-indigo-200"
                            )}
                        >
                            <FileType className="w-4 h-4" /> A4 세로
                        </button>
                        <button
                            onClick={() => { setPageSize('a4'); setOrientation('landscape'); }}
                            className={cn(
                                "px-3 py-2 rounded-lg text-sm font-medium border transition-colors flex items-center justify-center gap-2",
                                pageSize === 'a4' && orientation === 'landscape'
                                    ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                                    : "bg-white border-slate-200 text-slate-600 hover:border-indigo-200"
                            )}
                        >
                            <FileType className="w-4 h-4 rotate-90" /> A4 가로
                        </button>
                        <button
                            onClick={() => { setPageSize('a3'); setOrientation('portrait'); }}
                            className={cn(
                                "px-3 py-2 rounded-lg text-sm font-medium border transition-colors flex items-center justify-center gap-2",
                                pageSize === 'a3' && orientation === 'portrait'
                                    ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                                    : "bg-white border-slate-200 text-slate-600 hover:border-indigo-200"
                            )}
                        >
                            <FileType className="w-4 h-4" /> A3 세로
                        </button>
                        <button
                            onClick={() => { setPageSize('a3'); setOrientation('landscape'); }}
                            className={cn(
                                "px-3 py-2 rounded-lg text-sm font-medium border transition-colors flex items-center justify-center gap-2",
                                pageSize === 'a3' && orientation === 'landscape'
                                    ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                                    : "bg-white border-slate-200 text-slate-600 hover:border-indigo-200"
                            )}
                        >
                            <FileType className="w-4 h-4 rotate-90" /> A3 가로
                        </button>
                        <button
                            onClick={() => setPageSize('16:9')}
                            className={cn(
                                "px-3 py-2 rounded-lg text-sm font-medium border transition-colors",
                                pageSize === '16:9'
                                    ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                                    : "bg-white border-slate-200 text-slate-600 hover:border-indigo-200"
                            )}
                        >
                            16:9
                        </button>
                        <button
                            onClick={() => setPageSize('9:16')}
                            className={cn(
                                "px-3 py-2 rounded-lg text-sm font-medium border transition-colors",
                                pageSize === '9:16'
                                    ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                                    : "bg-white border-slate-200 text-slate-600 hover:border-indigo-200"
                            )}
                        >
                            9:16
                        </button>
                        <button
                            onClick={() => setPageSize('original')}
                            className={cn(
                                "col-span-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors",
                                pageSize === 'original'
                                    ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                                    : "bg-white border-slate-200 text-slate-600 hover:border-indigo-200"
                            )}
                        >
                            원본 크기 유지
                        </button>
                    </div>
                </div>

                {/* Quality */}
                <div>
                    <label className="text-xs font-medium text-slate-700 mb-1.5 block">품질 및 용량</label>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        {['low', 'medium', 'high'].map((q) => (
                            <button
                                key={q}
                                onClick={() => setQuality(q as any)}
                                className={cn(
                                    "flex-1 py-1.5 text-xs font-medium rounded-md transition-all capitalize",
                                    quality === q ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                {q === 'original' ? 'Original' : q}
                            </button>
                        ))}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5 text-right">
                        {quality === 'low' && '용량 최소화 (웹 공유용)'}
                        {quality === 'medium' && '균형 잡힌 품질 (일반용)'}
                        {quality === 'high' && '최고 품질 (인쇄용)'}
                    </p>
                </div>
            </div>

            <div className="mt-auto">
                <button
                    onClick={handleExport}
                    disabled={pages.length === 0 || isExporting}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                    {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                    {isExporting ? '처리 중...' : (format === 'img' ? '이미지 병합' : '파일 내보내기')}
                </button>

                <button
                    onClick={() => {
                        if (confirm('모든 작업을 초기화하시겠습니까?')) clearAll();
                    }}
                    disabled={pages.length === 0}
                    className="w-full mt-3 py-2 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    작업 초기화
                </button>
            </div>
        </div>
    );
}
