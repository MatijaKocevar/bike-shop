import { getTranslations } from "next-intl/server";
import { FormDialog } from "@/components/form-dialog";
import { TicketForm } from "@/components/ticket-form";
import { nextDayKey, parseMonthKey, todayKey } from "@/lib/dates";
import { listBikeOptions } from "@/queries/bikes";
import { listCustomerOptions } from "@/queries/customers";
import { listActiveProductOptions } from "@/queries/products";
import {
    getReservationById,
    listReservationsBetween,
    listReservationsForDay,
} from "@/queries/reservations";
import type { ReservationListItem } from "@/queries/reservations.types";
import { createReservation } from "./_actions/create-reservation";
import { deleteReservation } from "./_actions/delete-reservation";
import { updateReservation } from "./_actions/update-reservation";
import { DayReservations } from "./_components/day-reservations";
import { MonthCalendar } from "./_components/month-calendar";
import { buildMonthGrid } from "./_utils/month-grid";

type CalendarPageProps = {
    searchParams: Promise<{
        month?: string;
        new?: string;
        id?: string;
        date?: string;
        day?: string;
    }>;
};

function monthHref(year: number, month: number): string {
    return `/calendar?month=${year}-${String(month).padStart(2, "0")}`;
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
    const { month, new: isNew, id, date, day } = await searchParams;
    const { year, month: monthNumber } = parseMonthKey(month);
    const days = buildMonthGrid(year, monthNumber);
    const firstKey = days[0].key;
    const lastKey = days[days.length - 1].key;
    const currentMonthHref = monthHref(year, monthNumber);

    const [reservations, customers, bikes, products, editing, dayReservations] = await Promise.all([
        listReservationsBetween(firstKey, nextDayKey(lastKey)),
        listCustomerOptions(),
        listBikeOptions(),
        listActiveProductOptions(),
        id ? getReservationById(id) : null,
        day ? listReservationsForDay(day) : null,
    ]);
    const t = await getTranslations("calendar");

    const byDay = new Map<string, ReservationListItem[]>();
    for (const reservation of reservations) {
        const list = byDay.get(reservation.date) ?? [];
        list.push(reservation);
        byDay.set(reservation.date, list);
    }

    const prev =
        monthNumber === 1 ? { year: year - 1, month: 12 } : { year, month: monthNumber - 1 };
    const next =
        monthNumber === 12 ? { year: year + 1, month: 1 } : { year, month: monthNumber + 1 };

    return (
        <>
            <MonthCalendar
                year={year}
                month={monthNumber}
                days={days}
                byDay={byDay}
                monthHref={currentMonthHref}
                prevHref={monthHref(prev.year, prev.month)}
                nextHref={monthHref(next.year, next.month)}
            />

            <FormDialog
                open={Boolean(isNew)}
                onCloseHref={currentMonthHref}
                title={t("newTitle")}
                className="overflow-y-hidden sm:h-[90dvh] sm:max-w-5xl"
            >
                {isNew ? (
                    <TicketForm
                        customers={customers}
                        bikes={bikes}
                        products={products}
                        cancelHref={currentMonthHref}
                        createAction={createReservation}
                        updateAction={updateReservation}
                        defaultDate={date ?? todayKey()}
                        reservations={reservations}
                    />
                ) : null}
            </FormDialog>

            <FormDialog
                open={Boolean(editing)}
                onCloseHref={currentMonthHref}
                title={t("editTitle")}
                className="overflow-y-hidden sm:h-[90dvh] sm:max-w-5xl"
            >
                {editing ? (
                    <TicketForm
                        customers={customers}
                        bikes={bikes}
                        products={products}
                        cancelHref={currentMonthHref}
                        createAction={createReservation}
                        updateAction={updateReservation}
                        deleteAction={deleteReservation}
                        reservation={editing}
                        reservations={reservations}
                    />
                ) : null}
            </FormDialog>

            <FormDialog
                open={Boolean(day) && !isNew && !editing}
                onCloseHref={currentMonthHref}
                title={t("dayTitle")}
                className="sm:max-w-lg"
            >
                {day ? (
                    <DayReservations
                        day={day}
                        month={`${year}-${String(monthNumber).padStart(2, "0")}`}
                        reservations={dayReservations ?? []}
                    />
                ) : null}
            </FormDialog>
        </>
    );
}
