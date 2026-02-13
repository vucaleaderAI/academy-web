import { addDays, getDay, parseISO, format, differenceInCalendarWeeks } from 'date-fns';
import DateHolidays from 'date-holidays';

const hd = new DateHolidays('KR');

export interface DayOverride {
    isTraining: boolean;
    hours: number;
    memo?: string;
}

export type CustomDaysMap = Record<string, DayOverride>;

export interface CalculateResult {
    trainingDates: Date[];
    endDate: Date | null;
    totalDays: number;
    scheduledHours: Record<string, number>;
}

export function calculateTrainingSchedule(
    startDateStr: string,
    totalHours: number,
    defaultDailyHours: number,
    trainingDaysA: boolean[], // Week A (Default)
    trainingDaysB: boolean[] | null, // Week B (Optional)
    customDays: CustomDaysMap
): CalculateResult {
    if (!startDateStr || totalHours <= 0 || defaultDailyHours <= 0) {
        return { trainingDates: [], endDate: null, totalDays: 0, scheduledHours: {} };
    }

    let current = parseISO(startDateStr);
    const startDate = parseISO(startDateStr);
    let hoursRemaining = totalHours;
    let tempTrainingDates: Date[] = [];
    let safeGuard = 0;
    const MAX_DAYS = 365 * 3; // Max 3 years

    // Monday start for academic weeks
    const WEEK_STARTS_ON = 1;

    let scheduledHoursMap: Record<string, number> = {};

    while (hoursRemaining > 0 && safeGuard < MAX_DAYS) {
        const dateStr = format(current, 'yyyy-MM-dd');
        const dayOfWeek = getDay(current);

        // 1. Check Custom Override first
        const override = customDays[dateStr];

        let isTrainingDay = false;
        let dailyHours = defaultDailyHours;

        if (override) {
            // Strictly follow override
            isTrainingDay = override.isTraining;
            dailyHours = override.hours;
        } else {
            // 2. Default Logic (Bi-weekly)
            let currentPattern = trainingDaysA;

            if (trainingDaysB) {
                const weekIndex = differenceInCalendarWeeks(current, startDate, { weekStartsOn: WEEK_STARTS_ON });
                if (weekIndex % 2 !== 0) {
                    currentPattern = trainingDaysB; // Week B (Odd weeks relative to start)
                }
            }

            const isDayOfWeekTraining = currentPattern[dayOfWeek];

            // Check Holiday
            const holiday = hd.isHoliday(current);
            const isHoliday = !!holiday;

            if (isDayOfWeekTraining && !isHoliday) {
                isTrainingDay = true;
            }
        }

        if (isTrainingDay) {
            // Cap hours if remaining is less than daily hours
            const actualHours = Math.min(hoursRemaining, dailyHours);

            // Record logical hours for this day
            scheduledHoursMap[dateStr] = actualHours;

            hoursRemaining -= actualHours;
            tempTrainingDates.push(new Date(current));
        }

        if (hoursRemaining > 0) {
            current = addDays(current, 1);
        }
        safeGuard++;
    }

    return {
        trainingDates: tempTrainingDates,
        endDate: tempTrainingDates.length > 0 ? tempTrainingDates[tempTrainingDates.length - 1] : null,
        totalDays: tempTrainingDates.length,
        scheduledHours: scheduledHoursMap
    };
}

export function getHolidayName(date: Date): string | null {
    const holiday = hd.isHoliday(date);
    if (!holiday) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const h = holiday as any;
    if (Array.isArray(h)) return h[0].name;
    return h.name;
}
