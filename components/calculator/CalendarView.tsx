import React from 'react';
import {
    format,
    addMonths,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isWeekend,
    getDay,
    parseISO
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getHolidayName } from '@/utils/trainingCalculator';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CalendarViewProps {
    startDateStr: string;
    trainingDates: Date[];
    endDate: Date | null;
    onDateClick: (date: Date) => void;
}

export default function CalendarView({
    startDateStr,
    trainingDates,
    endDate,
    onDateClick,
}: CalendarViewProps) {
    const startDate = parseISO(startDateStr);

    // 12 months array
    const months = Array.from({ length: 12 }, (_, i) => startOfMonth(addMonths(startDate, i)));

    const isTrainingDay = (date: Date) => {
        return trainingDates.some(d => isSameDay(d, date));
    };

    return (
        <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {months.map((monthStart, i) => (
                    <MonthGrid
                        key={i}
                        monthStart={monthStart}
                        isTrainingDay={isTrainingDay}
                        startDate={startDate}
                        endDate={endDate}
                        onDateClick={onDateClick}
                    />
                ))}
            </div>
        </div>
    );
}

interface MonthGridProps {
    monthStart: Date;
    isTrainingDay: (date: Date) => boolean;
    startDate: Date;
    endDate: Date | null;
    onDateClick: (date: Date) => void;
}

function MonthGrid({ monthStart, isTrainingDay, startDate, endDate, onDateClick }: MonthGridProps) {
    const monthEnd = endOfMonth(monthStart);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Pad empty days at start
    const startDay = getDay(monthStart); // 0 (Sun) - 6 (Sat)
    const blanks = Array.from({ length: startDay });

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col">
            <div className="text-center font-bold text-slate-800 mb-3 text-sm">
                {format(monthStart, 'yyyy년 M월', { locale: ko })}
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
                    <div key={day} className={cn("text-[10px] font-medium", idx === 0 ? "text-red-400" : "text-slate-400")}>
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1 flex-1 content-start">
                {blanks.map((_, i) => (
                    <div key={`blank-${i}`} />
                ))}

                {days.map((date) => {
                    const isTraining = isTrainingDay(date);
                    const isStart = isSameDay(date, startDate);
                    const isEnd = endDate && isSameDay(date, endDate);
                    const isSat = getDay(date) === 6;
                    const isSun = getDay(date) === 0;

                    const isHoliday = !!getHolidayName(date);

                    return (
                        <button
                            key={date.toISOString()}
                            onClick={() => onDateClick(date)}
                            className={cn(
                                "aspect-square rounded-lg flex items-center justify-center text-xs relative transition-all",
                                "hover:scale-110 active:scale-95",
                                isTraining
                                    ? "bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100"
                                    : "bg-transparent hover:bg-slate-50 text-slate-600",
                                (isSun && !isTraining) && "text-red-400 bg-red-50/30",
                                (isSat && !isTraining) && "text-blue-400 bg-blue-50/30",
                                (isHoliday && !isTraining) && "text-red-500 font-bold bg-red-50",
                                isStart && "ring-2 ring-indigo-600 ring-offset-1 z-10",
                                isEnd && "ring-2 ring-rose-500 ring-offset-1 z-10 bg-rose-50 text-rose-700 font-black",
                            )}
                        >
                            {format(date, 'd')}
                            {isEnd && (
                                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
