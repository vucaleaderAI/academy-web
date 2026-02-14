'use client';
import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import LeftSidebar from '@/components/sidebar/LeftSidebar';
import NoteSidebar from '@/components/notepad/NoteSidebar';
import NoteEditor from '@/components/notepad/NoteEditor';

export default function NotepadPage() {
    // Client-side only rendering to avoid hydration mismatch with localStorage
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <MainLayout
            leftSidebar={<LeftSidebar />}
        // No RightSidebar passed, so MainLayout will expand main content to col-span-8 (80%)
        >
            <div className="flex h-full">
                {/* Note List Sidebar (Approx 30% of main area) */}
                <div className="w-80 border-r border-slate-100 flex-shrink-0">
                    <NoteSidebar />
                </div>

                {/* Editor Area (Remaining space) */}
                <div className="flex-1 overflow-hidden">
                    <NoteEditor />
                </div>
            </div>
        </MainLayout>
    );
}
