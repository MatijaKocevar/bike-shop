import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { FormDialog } from "@/components/form-dialog";
import { TicketForm } from "@/components/ticket-form";
import { buttonVariants } from "@/components/ui/button";
import { nextDayKey, todayKey } from "@/lib/dates";
import { listBikeOptions } from "@/queries/bikes";
import { listCustomerOptions } from "@/queries/customers";
import { listActiveProductOptions } from "@/queries/products";
import { getReservationById, listReservationsBetween } from "@/queries/reservations";
import type { ReservationListItem } from "@/queries/reservations.types";
import { createReservation } from "./_actions/create-reservation";
import { deleteReservation } from "./_actions/delete-reservation";
import { updateReservation } from "./_actions/update-reservation";
import { WeekList } from "./_components/week-list";
import { buildWeek, currentWeekKey, shiftWeekKey } from "./_utils/week-window";

type CalendarPageProps = {
    searchParams: Promise<{ week?: string; new?: string; id?: string; date?: string }>;
};

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
    const { week, new: isNew, id, date } = await searchParams;
    const days = buildWeek(week);
    const weekKey = days[0].key;
    const weekHref = `/calendar?week=${weekKey}`;
    const firstKey = days[0].key;
    const lastKey = days[6].key;

    const [reservations, customers, bikes, products, editing] = await Promise.all([
        listReservationsBetween(firstKey, nextDayKey(lastKey)),
        listCustomerOptions(),
        listBikeOptions(),
        listActiveProductOptions(),
        id ? getReservationById(id) : null,
    ]);
    const t = await getTranslations("calendar");
    const locale = await getLocale();

    const byDay = new Map<string, ReservationListItem[]>();
    for (const reservation of reservations) {
        const list = byDay.get(reservation.date) ?? [];
        list.push(reservation);
        byDay.set(reservation.date, list);
    }

    const rangeFormat = new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "numeric",
    });
    const first = days[0];
    const last = days[6];
    const range = `${rangeFormat.format(
        new Date(first.year, first.month - 1, first.day),
    )} – ${rangeFormat.format(new Date(last.year, last.month - 1, last.day))}`;
    const current = currentWeekKey();
    const label =
        weekKey === current
            ? `${t("thisWeek")} · ${range}`
            : weekKey === shiftWeekKey(current, 1)
              ? `${t("nextWeek")} · ${range}`
              : range;

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <Link
                        href={`/calendar?week=${shiftWeekKey(weekKey, -1)}`}
                        aria-label={t("prevWeek")}
                        className={buttonVariants({ variant: "outline", size: "icon-sm" })}
                    >
                        <ChevronLeft className="size-4" />
                    </Link>
                    <span className="min-w-44 text-center text-sm font-medium capitalize">
                        {label}
                    </span>
                    <Link
                        href={`/calendar?week=${shiftWeekKey(weekKey, 1)}`}
                        aria-label={t("nextWeek")}
                        className={buttonVariants({ variant: "outline", size: "icon-sm" })}
                    >
                        <ChevronRight className="size-4" />
                    </Link>
                </div>

                <div className="ml-auto flex items-center gap-2">
                    <Link
                        href="/calendar"
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                        <CalendarDays className="size-4" />
                        {t("today")}
                    </Link>
                    <Link
                        href="/calendar?new=1"
                        scroll={false}
                        className={buttonVariants({ size: "sm" })}
                    >
                        <Plus className="size-4" />
                        {t("new")}
                    </Link>
                </div>
            </div>

            <WeekList days={days} byDay={byDay} weekHref={weekHref} />

            <FormDialog
                open={Boolean(isNew)}
                onCloseHref={weekHref}
                title={t("newTitle")}
                className="sm:h-[90dvh] sm:max-w-5xl sm:overflow-y-hidden"
            >
                {isNew ? (
                    <TicketForm
                        customers={customers}
                        bikes={bikes}
                        products={products}
                        cancelHref={weekHref}
                        createAction={createReservation}
                        updateAction={updateReservation}
                        defaultDate={date ?? todayKey()}
                        reservations={reservations}
                    />
                ) : null}
            </FormDialog>

            <FormDialog
                open={Boolean(editing)}
                onCloseHref={weekHref}
                title={t("editTitle")}
                className="sm:h-[90dvh] sm:max-w-5xl sm:overflow-y-hidden"
            >
                {editing ? (
                    <TicketForm
                        customers={customers}
                        bikes={bikes}
                        products={products}
                        cancelHref={weekHref}
                        createAction={createReservation}
                        updateAction={updateReservation}
                        deleteAction={deleteReservation}
                        reservation={editing}
                        reservations={reservations}
                    />
                ) : null}
            </FormDialog>
        </div>
    );
}
