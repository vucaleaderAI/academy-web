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
            rightSidebar={<NoteSidebar />}
        >
            <div className="h-full overflow-hidden flex flex-col">
                <NoteEditor />
            </div>
        </MainLayout>
    );
}
