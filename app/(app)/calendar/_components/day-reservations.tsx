import Link from "next/link";
import { Plus } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";
import { formatTime, parseDateKey } from "@/lib/dates";
import type { ReservationListItem } from "@/queries/reservations.types";

type DayReservationsProps = {
    day: string;
    month: string;
    reservations: ReservationListItem[];
};

export async function DayReservations({ day, month, reservations }: DayReservationsProps) {
    const t = await getTranslations("calendar");
    const locale = await getLocale();
    const { year, month: monthNumber, day: dayNumber } = parseDateKey(day);
    const label = new Intl.DateTimeFormat(locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
    }).format(new Date(year, monthNumber - 1, dayNumber));

    return (
        <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground capitalize">{label}</p>

            {reservations.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("empty")}</p>
            ) : (
                <ul className="divide-y">
                    {reservations.map((item) => (
                        <li key={item.id}>
                            <Link
                                href={`/calendar?month=${month}&id=${item.id}`}
                                className="flex items-center justify-between gap-3 py-2.5 text-sm"
                            >
                                <span className="min-w-0 flex-1">
                                    <span className="font-medium tabular-nums">
                                        {formatTime(item.startMinutes)}
                                    </span>
                                    <span className="text-muted-foreground">
                                        {" – "}
                                        {formatTime(item.startMinutes + item.durationMinutes)}
                                    </span>
                                    <span className="ml-2">{item.customerName ?? t("walkIn")}</span>
                                    {item.bikeName && (
                                        <span className="text-muted-foreground">
                                            {" · "}
                                            {item.bikeName}
                                        </span>
                                    )}
                                </span>

                                {item.ticketNumber !== null && (
                                    <span className="shrink-0 text-xs text-muted-foreground">
                                        #{item.ticketNumber}
                                    </span>
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}

            <div className="flex justify-end">
                <Link
                    href={`/calendar?month=${month}&new=1&date=${day}`}
                    className={buttonVariants({ size: "sm" })}
                >
                    <Plus className="size-4" />
                    {t("new")}
                </Link>
            </div>
        </div>
    );
}
