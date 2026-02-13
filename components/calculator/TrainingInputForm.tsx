import React from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle2, RotateCcw } from 'lucide-react';

interface InputFormProps {
    startDate: string;
    setStartDate: (date: string) => void;
    totalHours: number;
    setTotalHours: (hours: number) => void;
    dailyHours: number;
    setDailyHours: (hours: number) => void;
    trainingDays: boolean[];
    setTrainingDays: (days: boolean[]) => void;
    trainingDaysB: boolean[] | null;
    setTrainingDaysB: (days: boolean[] | null) => void;
    onCalculate: () => void;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function TrainingInputForm({
    startDate,
    setStartDate,
    totalHours,
    setTotalHours,
    dailyHours,
    setDailyHours,
    trainingDays,
    setTrainingDays,
    trainingDaysB,
    setTrainingDaysB,
    onCalculate,
}: InputFormProps) {
    const toggleDay = (index: number, isWeekB: boolean = false) => {
        if (isWeekB) {
            if (!trainingDaysB) return;
            const newDays = [...trainingDaysB];
            newDays[index] = !newDays[index];
            setTrainingDaysB(newDays);
        } else {
            const newDays = [...trainingDays];
            newDays[index] = !newDays[index];
            setTrainingDays(newDays);
        }
    };

    const applyPreset = (type: string) => {
        // Indices: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat

        // Helperes
        const MWF = [false, true, false, true, false, true, false];
        const MW = [false, true, false, true, false, false, false];
        const TT = [false, false, true, false, true, false, false];
        const TTF = [false, false, true, false, true, true, false];
        const MON_FRI = [false, true, true, true, true, true, false];
        const SAT = [false, false, false, false, false, false, true];
        const SAT_SUN = [true, false, false, false, false, false, true];

        switch (type) {
            case 'mon-fri': // 월~금
                setTrainingDays(MON_FRI);
                setTrainingDaysB(null);
                break;
            case 'mwf': // 월수금
                setTrainingDays(MWF);
                setTrainingDaysB(null);
                break;
            case 'mw': // 월수
                setTrainingDays(MW);
                setTrainingDaysB(null);
                break;
            case 'tt': // 화목
                setTrainingDays(TT);
                setTrainingDaysB(null);
                break;
            case 'ttf': // 화목금
                setTrainingDays(TTF);
                setTrainingDaysB(null);
                break;
            case 'sat': // 토
                setTrainingDays(SAT);
                setTrainingDaysB(null);
                break;
            case 'sat-sun': // 토일
                setTrainingDays(SAT_SUN);
                setTrainingDaysB(null);
                break;

            // Bi-weekly
            case 'mwf-mw': // 월수금/월수
                setTrainingDays(MWF);
                setTrainingDaysB(MW);
                break;
            case 'mw-mwf': // 월수/월수금
                setTrainingDays(MW);
                setTrainingDaysB(MWF);
                break;
            case 'ttf-tt': // 화목금/화목
                setTrainingDays(TTF);
                setTrainingDaysB(TT);
                break;
            case 'tt-ttf': // 화목/화목금
                setTrainingDays(TT);
                setTrainingDaysB(TTF);
                break;
            default:
                break;
        }
    };

    const PresetButton = ({ label, type, isBiWeekly = false }: { label: string, type: string, isBiWeekly?: boolean }) => (
        <button
            onClick={() => applyPreset(type)}
            className={`
                px-2.5 py-1.5 text-[11px] rounded-lg font-medium transition-colors border
                ${isBiWeekly
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100'
                    : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'}
            `}
        >
            {label}
        </button>
    );

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                        <CalendarIcon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800">훈련 설정</h2>
                </div>

                {/* Presets Grid */}
                <div className="flex flex-wrap gap-2 items-center">
                    <PresetButton label="월~금" type="mon-fri" />

                    <PresetButton label="월수" type="mw" />
                    <PresetButton label="월수금" type="mwf" />
                    <PresetButton label="월수금/월수" type="mwf-mw" isBiWeekly />
                    <PresetButton label="월수/월수금" type="mw-mwf" isBiWeekly />

                    <PresetButton label="화목" type="tt" />
                    <PresetButton label="화목금" type="ttf" />
                    <PresetButton label="화목/화목금" type="tt-ttf" isBiWeekly />
                    <PresetButton label="화목금/화목" type="ttf-tt" isBiWeekly />

                    <PresetButton label="토" type="sat" />
                    <PresetButton label="토일" type="sat-sun" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* ... Inputs ... */}
                {/* (Keeping existing inputs but updating step) */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">개강일</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">총 훈련시간</label>
                    <div className="relative">
                        <input
                            type="number"
                            value={totalHours}
                            onChange={(e) => setTotalHours(Number(e.target.value))}
                            onKeyDown={(e) => e.key === 'Enter' && onCalculate()}
                            className="w-full px-4 py-2 pl-10 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
                        />
                        <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">1일 훈련시간 (0.5단위)</label>
                    <div className="relative">
                        <input
                            type="number"
                            step="0.5"
                            value={dailyHours}
                            onChange={(e) => setDailyHours(Number(e.target.value))}
                            className="w-full px-4 py-2 pl-10 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
                        />
                        <RotateCcw className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-600 block">
                        훈련 요일
                        {trainingDaysB && <span className="text-indigo-500 text-xs ml-2 font-bold">(A주 / B주)</span>}
                    </label>

                    {/* Week A */}
                    <div className="flex justify-between gap-1">
                        {WEEKDAYS.map((day, idx) => (
                            <button
                                key={`a-${day}`}
                                onClick={() => toggleDay(idx, false)}
                                className={`
                                    w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all
                                    ${trainingDays[idx]
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}
                                `}
                            >
                                {day}
                            </button>
                        ))}
                    </div>

                    {/* Week B (Conditional) */}
                    {trainingDaysB && (
                        <div className="flex justify-between gap-1 animate-in fade-in slide-in-from-top-2">
                            {WEEKDAYS.map((day, idx) => (
                                <button
                                    key={`b-${day}`}
                                    onClick={() => toggleDay(idx, true)}
                                    className={`
                                        w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all border
                                        ${trainingDaysB[idx]
                                            ? 'bg-white border-indigo-500 text-indigo-600 shadow-sm'
                                            : 'bg-slate-50 border-transparent text-slate-300 hover:bg-slate-100'}
                                    `}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-2 flex justify-end">
                <button
                    onClick={onCalculate}
                    className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform hover:-translate-y-0.5 active:translate-y-0"
                >
                    <CheckCircle2 className="w-5 h-5" />
                    종강일 계산하기
                </button>
            </div>
        </div>
    );
}
