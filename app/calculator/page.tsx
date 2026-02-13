'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { format, parseISO, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import MainLayout from '@/components/layout/MainLayout';
import LeftSidebar from '@/components/sidebar/LeftSidebar';
import RightSidebar from '@/components/sidebar/RightSidebar';
import TrainingInputForm from '@/components/calculator/TrainingInputForm';
import CalendarView from '@/components/calculator/CalendarView';
import { calculateTrainingSchedule, getHolidayName, type CustomDaysMap } from '@/utils/trainingCalculator';
import { Download, Calculator } from 'lucide-react';

export default function CalculatorPage() {
    // --- State ---
    const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [totalHours, setTotalHours] = useState(600);
    const [dailyHours, setDailyHours] = useState(8);
    const [trainingDays, setTrainingDays] = useState([false, true, true, true, true, true, false]); // Mon-Fri default
    const [trainingDaysB, setTrainingDaysB] = useState<boolean[] | null>(null); // Week B

    const [calculatedEndDate, setCalculatedEndDate] = useState<Date | null>(null);
    const [trainingDates, setTrainingDates] = useState<Date[]>([]);
    const [scheduledHours, setScheduledHours] = useState<Record<string, number>>({});

    // Advanced: Custom Overrides & Selected Date
    const [customDays, setCustomDays] = useState<CustomDaysMap>({});
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // --- Logic ---
    const performCalculation = useCallback(() => {
        const result = calculateTrainingSchedule(
            startDate,
            totalHours,
            dailyHours,
            trainingDays,
            trainingDaysB,
            customDays
        );
        setTrainingDates(result.trainingDates);
        setCalculatedEndDate(result.endDate);
        setScheduledHours(result.scheduledHours);
    }, [startDate, totalHours, dailyHours, trainingDays, trainingDaysB, customDays]);

    // Auto-calculate when dependencies change
    useEffect(() => {
        performCalculation();
    }, [performCalculation]);

    // --- Handlers ---
    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
    };

    const handleToggleTraining = () => {
        if (!selectedDate) return;
        const dateStr = format(selectedDate, 'yyyy-MM-dd');

        // Determine current state
        const override = customDays[dateStr];
        let isCurrentlyTraining = false;

        if (override) {
            isCurrentlyTraining = override.isTraining;
        } else {
            // Check default logic if no override
            // But we want to FORCE toggle.
            // If it's a training day by default, we want to make it NOT.
            // If it's NOT a training day by default, we want to make it TRAINING.
            // So we need to access the helper to know if it *would* be a training day?
            // Or simpler: check if it is in `trainingDates`?
            isCurrentlyTraining = trainingDates.some(d => isSameDay(d, selectedDate));
        }

        const newIsTraining = !isCurrentlyTraining;

        setCustomDays(prev => ({
            ...prev,
            [dateStr]: {
                isTraining: newIsTraining,
                hours: override?.hours || dailyHours, // Inherit or default
                memo: override?.memo || ''
            }
        }));
    };

    const handleChangeHours = (hours: number) => {
        if (!selectedDate) return;
        const dateStr = format(selectedDate, 'yyyy-MM-dd');

        setCustomDays(prev => ({
            ...prev,
            [dateStr]: {
                ...prev[dateStr],
                isTraining: true, // Changing hours implies it IS a training day
                hours: hours
            }
        }));
    };

    const handleChangeMemo = (memo: string) => {
        if (!selectedDate) return;
        const dateStr = format(selectedDate, 'yyyy-MM-dd');

        // If no override exists, we should probably create one that Respects the current training status?
        // Or just store memo? But calculateTrainingSchedule only looks at customDays for overrides.
        // It's fine, if we just want to add a memo without changing logic, we still need an entry.
        // But we need to know if it SHOULD be training or not to set `isTraining`.
        // Let's assume if user adds memo, they don't intend to change training status yet.

        // Check current status
        const isCurrentlyTraining = trainingDates.some(d => isSameDay(d, selectedDate));

        setCustomDays(prev => ({
            ...prev,
            [dateStr]: {
                isTraining: prev[dateStr]?.isTraining ?? isCurrentlyTraining,
                hours: prev[dateStr]?.hours ?? dailyHours,
                memo: memo
            }
        }));
    };

    const handleExport = () => {
        if (!calculatedEndDate) return;

        let content = `[훈련 일정표]\n`;
        content += `개강일: ${startDate}\n`;
        content += `종강일: ${format(calculatedEndDate, 'yyyy-MM-dd')}\n`;
        content += `총 훈련시간: ${totalHours}시간\n\n`;
        content += `[상세 일정]\n`;

        trainingDates.forEach((date, index) => {
            const dateStr = format(date, 'yyyy-MM-dd (EEE)', { locale: ko });
            const override = customDays[format(date, 'yyyy-MM-dd')];
            // Priority: Override Hours -> Calculated Scheduled Hours -> Daily Hours (fallback)
            let hours = dailyHours;
            if (override) {
                hours = override.hours;
            } else if (scheduledHours[format(date, 'yyyy-MM-dd')]) {
                hours = scheduledHours[format(date, 'yyyy-MM-dd')];
            }

            const memo = override?.memo ? ` (${override.memo})` : '';

            content += `${index + 1}일차: ${dateStr} (${hours}시간)${memo}\n`;
        });

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `훈련일정_${startDate}_to_${format(calculatedEndDate, 'yyyy-MM-dd')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };


    // --- Derived Props for RightSidebar ---
    const getRightSidebarProps = () => {
        if (!selectedDate) return null;
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const override = customDays[dateStr];
        const isTraining = trainingDates.some(d => isSameDay(d, selectedDate));
        const holiday = getHolidayName(selectedDate);

        return {
            selectedDate,
            isTraining,
            holidayName: holiday,
            hours: override?.hours || dailyHours,
            memo: override?.memo || '',
            onToggleTraining: handleToggleTraining,
            onChangeHours: handleChangeHours,
            onChangeMemo: handleChangeMemo,
            onClose: () => setSelectedDate(null)
        };
    };

    const rightSidebarProps = getRightSidebarProps();

    return (
        <MainLayout
            leftSidebar={<LeftSidebar />}
            rightSidebar={
                <RightSidebar
                    {...(rightSidebarProps || {
                        selectedDate: null,
                        isTraining: false,
                        holidayName: null,
                        hours: dailyHours,
                        memo: '',
                        onToggleTraining: () => { },
                        onChangeHours: () => { },
                        onChangeMemo: () => { }
                    })}
                />
            }
        >
            <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto">
                <div className="flex-none flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">훈련일수 계산기</h1>
                        <p className="text-slate-500">개강일부터 종강일까지의 훈련 일정을 스마트하게 관리하세요.</p>
                    </div>
                    {calculatedEndDate && (
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-semibold border border-indigo-100 shadow-sm"
                        >
                            <Download className="w-4 h-4" />
                            텍스트 내보내기
                        </button>
                    )}
                </div>

                <div className="w-full">
                    <TrainingInputForm
                        startDate={startDate}
                        setStartDate={setStartDate}
                        totalHours={totalHours}
                        setTotalHours={setTotalHours}
                        dailyHours={dailyHours}
                        setDailyHours={setDailyHours}
                        trainingDays={trainingDays}
                        setTrainingDays={setTrainingDays}
                        trainingDaysB={trainingDaysB}
                        setTrainingDaysB={setTrainingDaysB}
                        onCalculate={performCalculation}
                    />
                </div>

                {calculatedEndDate && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-6 bg-indigo-900 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between">
                            <div>
                                <div className="text-indigo-200 text-sm font-medium mb-1">예상 종강일</div>
                                <div className="text-3xl font-bold tracking-tight">
                                    {format(calculatedEndDate, 'yyyy년 M월 d일 (EEE)', { locale: ko })}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-indigo-200 text-sm font-medium mb-1">총 훈련일수</div>
                                <div className="text-3xl font-bold">{trainingDates.length}일</div>
                            </div>
                        </div>

                        <CalendarView
                            startDateStr={startDate}
                            trainingDates={trainingDates}
                            endDate={calculatedEndDate}
                            onDateClick={handleDateClick}
                        />
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
