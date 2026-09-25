export function dateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export function todayKey(): string {
    return dateKey(new Date());
}

export function monthKey(date: Date): string {
    return dateKey(date).slice(0, 7);
}

export function nextDayKey(date: string): string {
    const [year, month, day] = date.split("-").map(Number);
    const next = new Date(year, month - 1, day + 1);

    return dateKey(next);
}

export function formatTime(minutes: number): string {
    const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
    const mins = String(minutes % 60).padStart(2, "0");

    return `${hours}:${mins}`;
}

export function parseTime(value: string): number | null {
    const match = /^(\d{1,2}):(\d{2})$/.exec(value);
    if (!match) return null;

    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours > 23 || minutes > 59) return null;

    return hours * 60 + minutes;
}

export function parseDateKey(date: string): { year: number; month: number; day: number } {
    const [year, month, day] = date.split("-").map(Number);

    return { year, month, day };
}

export function parseMonthKey(month?: string): { year: number; month: number } {
    if (month && /^\d{4}-\d{2}$/.test(month)) {
        const [year, monthNumber] = month.split("-").map(Number);
        if (monthNumber >= 1 && monthNumber <= 12) return { year, month: monthNumber };
    }

    const now = new Date();

    return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function isValidDateKey(date: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;

    const { year, month, day } = parseDateKey(date);
    if (month < 1 || month > 12 || day < 1 || day > 31) return false;

    const parsed = new Date(year, month - 1, day);

    return (
        parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day
    );
}
