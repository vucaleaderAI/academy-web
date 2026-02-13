import React from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar, Clock, StickyNote, ToggleLeft, ToggleRight, X } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming you have a utils file, or I'll use clsx directly if not

interface RightSidebarProps {
    selectedDate?: Date | null;
    isTraining?: boolean;
    holidayName?: string | null;
    hours?: number;
    memo?: string;
    onToggleTraining?: () => void;
    onChangeHours?: (hours: number) => void;
    onChangeMemo?: (memo: string) => void;
    onClose?: () => void;
}

export default function RightSidebar({
    selectedDate,
    isTraining,
    holidayName,
    hours,
    memo,
    onToggleTraining,
    onChangeHours,
    onChangeMemo,
    onClose
}: RightSidebarProps) {
    if (!selectedDate) {
        return (
            <div className="flex flex-col h-full bg-slate-50/50 p-6 items-center justify-center text-slate-400 text-center">
                <Calendar className="w-12 h-12 mb-3 opacity-20" />
                <div className="text-sm font-medium">날짜를 선택해주세요</div>
                <div className="text-xs mt-1 text-slate-400">달력에서 날짜를 클릭하면<br />상세 설정을 변경할 수 있습니다.</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-50 border-l border-slate-200">
            <div className="p-5 border-b border-slate-200 bg-white flex justify-between items-start">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">상세 설정</h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {format(selectedDate, 'yyyy년 M월 d일 EEEE', { locale: ko })}
                    </p>
                    {holidayName && (
                        <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600">
                            {holidayName}
                        </span>
                    )}
                </div>
                {onClose && (
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            <div className="flex-1 p-5 space-y-8 overflow-y-auto">
                {/* 1. Training Toggle */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        훈련 여부
                    </label>
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                        <span className={cn("font-medium", isTraining ? "text-indigo-600" : "text-slate-400")}>
                            {isTraining ? "훈련일입니다" : "훈련이 없습니다"}
                        </span>
                        <button
                            onClick={() => onToggleTraining && onToggleTraining()}
                            className={cn(
                                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
                                isTraining ? "bg-indigo-600" : "bg-slate-200"
                            )}
                        >
                            <span
                                className={cn(
                                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                    isTraining ? "translate-x-6" : "translate-x-1"
                                )}
                            />
                        </button>
                    </div>
                </div>

                {/* 2. Hours Adjustment */}
                {isTraining && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            훈련 시간
                        </label>
                        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-2xl font-bold text-slate-900">{hours}시간</span>
                                <span className="text-xs text-slate-400">/ 1일</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="12"
                                step="0.5"
                                value={hours}
                                onChange={(e) => onChangeHours && onChangeHours(Number(e.target.value))}
                                className="w-full accent-indigo-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-slate-400 font-medium px-0.5">
                                <span>1시간</span>
                                <span>12시간</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. Memo */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <StickyNote className="w-3.5 h-3.5" />
                        메모
                    </label>
                    <textarea
                        value={memo}
                        onChange={(e) => onChangeMemo && onChangeMemo(e.target.value)}
                        placeholder="이 날짜에 대한 메모를 남겨주세요."
                        className="w-full h-32 p-4 bg-white rounded-xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm leading-relaxed placeholder:text-slate-300"
                    />
                </div>
            </div>
        </div>
    );
}
