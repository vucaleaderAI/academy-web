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
    const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');
    const [isExporting, setIsExporting] = useState(false);

    // Helpers
    const getPageDimensions = (size: string, originalWidth: number, originalHeight: number) => {
        switch (size) {
            case 'a4': return PageSizes.A4;
            case 'a3': return PageSizes.A3;
            case '16:9': return [1920, 1080];
            case '9:16': return [1080, 1920];
            default: return [originalWidth, originalHeight];
        }
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

            if (format === 'pdf') {
                await exportToPdf(targets);
            } else {
                await exportToImages(targets);
            }
        } catch (error) {
            console.error(error);
            alert('내보내기 중 오류가 발생했습니다.');
        } finally {
            setIsExporting(false);
        }
    };

    const exportToPdf = async (targets: PdfPage[]) => {
        const mergedPdf = await PDFDocument.create();

        for (const page of targets) {
            // Load source file
            const fileBuffer = await page.originalFile.arrayBuffer();

            if (page.originalFile.type === 'application/pdf') {
                const srcPdf = await PDFDocument.load(fileBuffer);
                const [srcPage] = await mergedPdf.copyPages(srcPdf, [page.pageIndex]);

                // Get target dimensions
                const originalDims = srcPage.getSize();
                const [targetWidth, targetHeight] = getPageDimensions(pageSize, originalDims.width, originalDims.height);

                // If resize is needed (simplistic scaling)
                if (pageSize !== 'original') {
                    srcPage.scale(targetWidth / originalDims.width, targetHeight / originalDims.height);
                }

                // Apply rotation
                srcPage.setRotation(degrees(page.rotation));

                mergedPdf.addPage(srcPage);

            } else {
                // Image to PDF page
                let image;
                if (page.originalFile.type === 'image/png') {
                    image = await mergedPdf.embedPng(fileBuffer);
                } else {
                    image = await mergedPdf.embedJpg(fileBuffer);
                }

                const originalDims = image.scale(1);
                const [targetWidth, targetHeight] = getPageDimensions(pageSize, originalDims.width, originalDims.height);

                const pdfPage = mergedPdf.addPage([targetWidth, targetHeight]);

                // Draw image to fit page (contain)
                const scale = Math.min(targetWidth / originalDims.width, targetHeight / originalDims.height);
                const drawWidth = originalDims.width * scale;
                const drawHeight = originalDims.height * scale;
                const x = (targetWidth - drawWidth) / 2;
                const y = (targetHeight - drawHeight) / 2;

                pdfPage.drawImage(image, {
                    x,
                    y,
                    width: drawWidth,
                    height: drawHeight,
                    rotate: degrees(page.rotation),
                });
            }
        }

        const pdfBytes = await mergedPdf.save();
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
        saveAs(blob, `merged_${Date.now()}.pdf`);
    };

    const exportToImages = async (targets: PdfPage[]) => {
        const zip = new JSZip();
        const folder = zip.folder("images");

        for (let i = 0; i < targets.length; i++) {
            const page = targets[i];

            // For simplicity, we save the original image extracted/rendered in store if possible, 
            // but since imageSrc is dataURL, we can use that.
            // Note: This uses the preview resolution. For higher quality, we might need to re-render.
            // For MVP, we use the preview imageSrc which was rendered at 1.5 scale.

            const base64Data = page.imageSrc.split(',')[1];
            folder?.file(`page_${i + 1}.png`, base64Data, { base64: true });
        }

        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `images_${Date.now()}.zip`);
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
                            <span className="text-xs font-medium">이미지 (ZIP)</span>
                        </button>
                    </div>
                </div>

                {/* Size */}
                <div>
                    <label className="text-xs font-medium text-slate-700 mb-1.5 block">용지 크기 (PDF)</label>
                    <div className="relative">
                        <Maximize className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                            value={pageSize}
                            onChange={(e) => setPageSize(e.target.value as any)}
                            disabled={format === 'img'}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white disabled:bg-slate-50 disabled:text-slate-400"
                        >
                            <option value="original">원본 크기 유지</option>
                            <option value="a4">A4 (210 x 297 mm)</option>
                            <option value="a3">A3 (297 x 420 mm)</option>
                            <option value="16:9">16:9 (1920 x 1080 px)</option>
                            <option value="9:16">9:16 (1080 x 1920 px)</option>
                        </select>
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
                    {isExporting ? '처리 중...' : '파일 내보내기'}
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
