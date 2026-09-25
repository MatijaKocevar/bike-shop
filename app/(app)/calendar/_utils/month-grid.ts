import { dateKey, todayKey } from "@/lib/dates";
import type { CalendarDay } from "../_types/calendar-day";

export function buildMonthGrid(year: number, month: number): CalendarDay[] {
    const first = new Date(year, month - 1, 1);
    const offset = (first.getDay() + 6) % 7;
    const start = new Date(year, month - 1, 1 - offset);
    const today = todayKey();
    const days: CalendarDay[] = [];

    for (let index = 0; index < 42; index++) {
        const current = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
        const key = dateKey(current);

        days.push({
            key,
            year: current.getFullYear(),
            month: current.getMonth() + 1,
            day: current.getDate(),
            inMonth: current.getMonth() + 1 === month && current.getFullYear() === year,
            isToday: key === today,
        });
    }

    return days;
}
