import Link from "next/link";
import { Plus } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { formatTime } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { ReservationListItem } from "@/queries/reservations.types";
import type { CalendarDay } from "../_types/calendar-day";

type WeekListProps = {
    days: CalendarDay[];
    byDay: Map<string, ReservationListItem[]>;
    weekHref: string;
};

export async function WeekList({ days, byDay, weekHref }: WeekListProps) {
    const t = await getTranslations("calendar");
    const locale = await getLocale();
    const dayFormat = new Intl.DateTimeFormat(locale, {
        weekday: "long",
        day: "numeric",
        month: "numeric",
    });

    return (
        <ul className="flex min-h-0 flex-1 flex-col divide-y overflow-y-auto rounded-lg border">
            {days.map((day) => {
                const items = byDay.get(day.key) ?? [];

                return (
                    <li
                        key={day.key}
                        className={cn("flex flex-1 flex-col", day.isToday && "bg-primary/5")}
                    >
                        <Link
                            href={`${weekHref}&new=1&date=${day.key}`}
                            scroll={false}
                            className="flex items-center justify-between px-3 py-2 text-sm"
                        >
                            <span className={cn("capitalize", day.isToday && "font-semibold")}>
                                {dayFormat.format(new Date(day.year, day.month - 1, day.day))}
                            </span>
                            <Plus className="size-3.5 text-muted-foreground" />
                        </Link>

                        {items.length > 0 && (
                            <ul className="flex flex-col gap-1 px-3 pb-2">
                                {items.map((item) => (
                                    <li key={item.id}>
                                        <Link
                                            href={`${weekHref}&id=${item.id}`}
                                            scroll={false}
                                            className="flex items-baseline gap-2 rounded-md bg-secondary px-2 py-1.5 text-sm text-secondary-foreground"
                                        >
                                            <span className="shrink-0 font-medium tabular-nums">
                                                {formatTime(item.startMinutes)}
                                            </span>
                                            <span className="min-w-0 truncate">
                                                {item.customerName ?? item.note ?? t("walkIn")}
                                            </span>
                                            {item.bikeName && (
                                                <span className="ml-auto shrink-0 truncate text-xs text-muted-foreground">
                                                    {item.bikeName}
                                                </span>
                                            )}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}
