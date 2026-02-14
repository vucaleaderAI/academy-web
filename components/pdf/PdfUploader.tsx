'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import * as pdfjsLib from 'pdfjs-dist';
import { usePdfStore, PdfPage } from '@/store/pdfStore';
import { cn } from '@/lib/utils';

// pdfjs worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export default function PdfUploader() {
    const addPages = usePdfStore((state) => state.addPages);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

    const processFile = async (file: File) => {
        if (file.type === 'application/pdf') {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            const newPages: PdfPage[] = [];
            const fileId = uuidv4();

            setProgress({ current: 0, total: pdf.numPages });

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 1.5 }); // Increased scale for better quality
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                if (context) {
                    await page.render({ canvasContext: context, viewport } as any).promise;
                    newPages.push({
                        id: uuidv4(),
                        fileId,
                        pageIndex: i - 1,
                        imageSrc: canvas.toDataURL(),
                        originalFile: file,
                        width: viewport.width,
                        height: viewport.height,
                        rotation: 0,
                    });
                }
                setProgress({ current: i, total: pdf.numPages });
            }
            return newPages;
        } else if (file.type.startsWith('image/')) {
            return new Promise<PdfPage[]>((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        resolve([{
                            id: uuidv4(),
                            fileId: uuidv4(),
                            pageIndex: 0,
                            imageSrc: e.target?.result as string,
                            originalFile: file,
                            width: img.width,
                            height: img.height,
                            rotation: 0,
                        }]);
                    };
                    img.src = e.target?.result as string;
                };
                reader.readAsDataURL(file);
            });
        }
        return [];
    };

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setIsProcessing(true);
        const allNewPages: PdfPage[] = [];

        try {
            for (const file of acceptedFiles) {
                const pages = await processFile(file);
                allNewPages.push(...pages);
            }
            addPages(allNewPages);
        } catch (error) {
            console.error("Error processing files:", error);
            alert("파일 처리 중 오류가 발생했습니다.");
        } finally {
            setIsProcessing(false);
            setProgress(null);
        }
    }, [addPages]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/*': ['.png', '.jpg', '.jpeg', '.webp']
        }
    });

    return (
        <div className="w-full">
            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors bg-white/50 backdrop-blur-sm",
                    isDragActive ? "border-indigo-500 bg-indigo-50" : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50",
                    isProcessing && "pointer-events-none opacity-50"
                )}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-3">
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                            <div className="text-slate-600 font-medium">
                                파일 처리 중...
                                {progress && `(${progress.current} / ${progress.total})`}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="p-4 bg-indigo-100 rounded-full text-indigo-600 mb-2">
                                <Upload className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-700">
                                PDF 또는 이미지 파일 드래그 앤 드롭
                            </h3>
                            <p className="text-slate-500 text-sm">
                                또는 클릭하여 파일 선택 (PDF, JPG, PNG)
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
