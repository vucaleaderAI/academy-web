'use client';

import React from 'react';
import {
    NotebookPen,
    Calculator,
    FileText,
    Settings,
    User,
    LayoutDashboard,
    UserCheck,
    FileCheck,
    MapPin,
    BarChart3,
    Banknote
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const menuItems = [
    { name: '메모장', icon: NotebookPen, href: '/notepad' },
    { name: '훈련일수 계산기', icon: Calculator, href: '/calculator' },
    { name: 'PDF 에디터', icon: FileText, href: '/pdf' },
    { name: '강의장 운영 현황', icon: LayoutDashboard, href: '/classrooms' },
    { name: '단기 훈련생 출석 현황', icon: UserCheck, href: '/attendance' },
    { name: '실업급여 서류 발급', icon: FileCheck, href: '/documents' },
    { name: '지역별 개강 예정 과정 현황', icon: MapPin, href: '/regional-courses' },
    { name: '신도림_KPI', icon: BarChart3, href: '/kpi' },
    { name: '강사료 현황', icon: Banknote, href: '/instructor-fees' },
];

export default function LeftSidebar() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full bg-white p-4">
            <Link href="/" className="mb-8 px-2 pt-2 block hover:opacity-80 transition-opacity">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    아카데미<span className="text-indigo-600">웹</span>
                </h1>
                <p className="text-xs text-slate-500 mt-1">스마트한 학원 관리의 시작</p>
            </Link>

            <nav className="flex-1 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname?.startsWith(item.href);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                                isActive
                                    ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200"
                                    : "text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5 transition-colors flex-shrink-0",
                                isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-600"
                            )} />
                            <span className="truncate">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto border-t border-slate-100 pt-4 space-y-1">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors group">
                    <Settings className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    설정
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors group">
                    <User className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    프로필
                </button>
            </div>
        </div>
    );
}
