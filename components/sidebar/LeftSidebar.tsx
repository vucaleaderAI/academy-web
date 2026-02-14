import React from 'react';
import { NotebookPen, Calculator, FileText, Settings, User } from 'lucide-react';
import Link from 'next/link';

const menuItems = [
    { name: '메모장', icon: NotebookPen, href: '/notepad' }, // Updated link
    { name: '훈련일수 계산기', icon: Calculator, href: '/calculator' },
    { name: 'PDF 에디터', icon: FileText, href: '#' },
];

export default function LeftSidebar() {
    return (
        <div className="flex flex-col h-full bg-white p-4">
            <div className="mb-8 px-2 pt-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    아카데미<span className="text-indigo-600">웹</span>
                </h1>
                <p className="text-xs text-slate-500 mt-1">스마트한 학원 관리의 시작</p>
            </div>

            <nav className="flex-1 space-y-1">
                {menuItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors group"
                    >
                        <item.icon className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                        {item.name}
                    </Link>
                ))}
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
