'use client';

import React from 'react';
import PdfUploader from '@/components/pdf/PdfUploader';
import PdfPageGrid from '@/components/pdf/PdfPageGrid';
import PdfSidebar from '@/components/pdf/PdfSidebar';
import MainLayout from '@/components/layout/MainLayout';
import LeftSidebar from '@/components/sidebar/LeftSidebar';
import { usePdfStore } from '@/store/pdfStore';
import { FileStack } from 'lucide-react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PdfEditorPage() {
    const { pages } = usePdfStore();

    return (
        <MainLayout
            leftSidebar={<LeftSidebar />}
            rightSidebar={<PdfSidebar />}
        >
            <div className="flex flex-col h-full overflow-hidden relative">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600">
                                <FileStack className="w-5 h-5" />
                            </div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                                PDF 이미지 편집기
                            </h1>
                        </div>
                    </div>
                </header>

                {/* Content Scroll Area */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* Uploader - Always visible but smaller when pages exist */}
                        {pages.length === 0 ? (
                            <div className="py-20 animate-in fade-in zoom-in-95 duration-500">
                                <div className="max-w-2xl mx-auto text-center mb-8">
                                    <h2 className="text-3xl font-bold text-slate-800 mb-4">
                                        PDF와 이미지를 자유롭게 편집하세요
                                    </h2>
                                    <p className="text-slate-500 text-lg">
                                        여러 파일을 병합하거나, 페이지 순서를 변경하고, 원하는 포맷으로 내보낼 수 있습니다.
                                    </p>
                                </div>
                                <PdfUploader />
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="mb-6 flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-slate-700">페이지 목록 ({pages.length})</h2>
                                    <PdfUploader />
                                </div>
                                <PdfPageGrid />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
