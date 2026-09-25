import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";
import { formatTime } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { ReservationListItem } from "@/queries/reservations.types";
import type { CalendarDay } from "../_types/calendar-day";

type MonthCalendarProps = {
    year: number;
    month: number;
    days: CalendarDay[];
    byDay: Map<string, ReservationListItem[]>;
    monthHref: string;
    prevHref: string;
    nextHref: string;
};

export async function MonthCalendar({
    year,
    month,
    days,
    byDay,
    monthHref,
    prevHref,
    nextHref,
}: MonthCalendarProps) {
    const t = await getTranslations("calendar");
    const locale = await getLocale();
    const monthLabel = new Intl.DateTimeFormat(locale, {
        month: "long",
        year: "numeric",
    }).format(new Date(year, month - 1, 1));
    const weekdayLabels = Array.from({ length: 7 }, (_, index) =>
        new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(2024, 0, 1 + index)),
    );

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-3">
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
                <h1 className="text-lg font-semibold capitalize">{monthLabel}</h1>

                <div className="flex items-center gap-2">
                    <Link
                        href={prevHref}
                        aria-label={t("prev")}
                        className={buttonVariants({ variant: "outline", size: "icon-sm" })}
                    >
                        <ChevronLeft className="size-4" />
                    </Link>
                    <Link
                        href="/calendar"
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                        {t("today")}
                    </Link>
                    <Link
                        href={nextHref}
                        aria-label={t("next")}
                        className={buttonVariants({ variant: "outline", size: "icon-sm" })}
                    >
                        <ChevronRight className="size-4" />
                    </Link>
                    <Link href={`${monthHref}&new=1`} className={buttonVariants({ size: "sm" })}>
                        <Plus className="size-4" />
                        {t("new")}
                    </Link>
                </div>
            </div>

            <div className="grid shrink-0 grid-cols-7 text-center text-xs font-medium text-muted-foreground">
                {weekdayLabels.map((label, index) => (
                    <div key={index} className="py-1 capitalize">
                        {label}
                    </div>
                ))}
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                <div className="grid h-full min-h-[40rem] grid-cols-7 grid-rows-6 gap-px rounded-lg border bg-border">
                    {days.map((day) => {
                        const items = byDay.get(day.key) ?? [];
                        const visible = items.slice(0, 3);
                        const hidden = items.length - visible.length;
                        const dayHref = `/calendar?month=${day.key.slice(0, 7)}`;

                        return (
                            <div
                                key={day.key}
                                className={cn(
                                    "relative flex min-h-0 flex-col gap-1 bg-background p-1.5",
                                    !day.inMonth && "bg-muted/40 text-muted-foreground",
                                )}
                            >
                                <Link
                                    href={`${dayHref}&new=1&date=${day.key}`}
                                    aria-label={`${t("new")} ${day.key}`}
                                    className="absolute inset-0 rounded-sm transition-colors hover:bg-muted/50"
                                />

                                <Link
                                    href={`${dayHref}&new=1&date=${day.key}`}
                                    aria-label={`${t("new")} ${day.key}`}
                                    className={cn(
                                        "relative z-10 inline-flex size-5 shrink-0 items-center justify-center self-start rounded-full text-xs hover:bg-muted",
                                        day.isToday &&
                                            "bg-primary text-primary-foreground hover:bg-primary",
                                    )}
                                >
                                    {day.day}
                                </Link>

                                {visible.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={`${dayHref}&id=${item.id}`}
                                        className="relative z-10 truncate rounded bg-secondary px-1.5 py-0.5 text-[11px] leading-tight text-secondary-foreground hover:bg-secondary/70"
                                    >
                                        <span className="font-medium tabular-nums">
                                            {formatTime(item.startMinutes)}
                                        </span>{" "}
                                        {item.customerName ?? item.note ?? t("walkIn")}
                                    </Link>
                                ))}

                                {hidden > 0 && (
                                    <Link
                                        href={`${dayHref}&day=${day.key}`}
                                        className="relative z-10 text-[11px] text-muted-foreground hover:text-foreground"
                                    >
                                        {t("more", { count: hidden })}
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
