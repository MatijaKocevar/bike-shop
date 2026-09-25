import { dateKey, isValidDateKey, parseDateKey, todayKey } from "@/lib/dates";
import type { CalendarDay } from "../_types/calendar-day";

function mondayOf(date: Date): Date {
    const offset = (date.getDay() + 6) % 7;

    return new Date(date.getFullYear(), date.getMonth(), date.getDate() - offset);
}

export function mondayKeyOf(key: string): string {
    const { year, month, day } = parseDateKey(key);

    return dateKey(mondayOf(new Date(year, month - 1, day)));
}

export function currentWeekKey(): string {
    return mondayKeyOf(todayKey());
}

export function shiftWeekKey(key: string, offset: number): string {
    const { year, month, day } = parseDateKey(key);
    const shifted = new Date(year, month - 1, day + offset * 7);

    return dateKey(shifted);
}

export function buildWeek(week?: string): CalendarDay[] {
    const today = todayKey();
    const startKey = week && isValidDateKey(week) ? mondayKeyOf(week) : currentWeekKey();
    const { year, month, day } = parseDateKey(startKey);
    const days: CalendarDay[] = [];

    for (let index = 0; index < 7; index++) {
        const current = new Date(year, month - 1, day + index);
        const key = dateKey(current);

        days.push({
            key,
            year: current.getFullYear(),
            month: current.getMonth() + 1,
            day: current.getDate(),
            isToday: key === today,
        });
    }

    return days;
}
