import { nextDayKey, todayKey } from "@/lib/dates";
import { db } from "@/lib/db";
import type { ReservationDetail, ReservationListItem } from "@/queries/reservations.types";

export async function listReservationsBetween(
    startDate: string,
    endDate: string,
): Promise<ReservationListItem[]> {
    const rows = await db.reservation.findMany({
        where: { date: { gte: startDate, lt: endDate } },
        include: { ticket: { select: { number: true } } },
        orderBy: [{ date: "asc" }, { startMinutes: "asc" }],
    });

    return rows.map((row) => ({
        id: row.id,
        date: row.date,
        startMinutes: row.startMinutes,
        durationMinutes: row.durationMinutes,
        customerName: row.customerName,
        bikeName: row.bikeName,
        note: row.note,
        ticketNumber: row.ticket?.number ?? null,
    }));
}

export async function listReservationsForDay(date: string): Promise<ReservationListItem[]> {
    return listReservationsBetween(date, nextDayKey(date));
}

export async function listTodayReservations(): Promise<ReservationListItem[]> {
    return listReservationsForDay(todayKey());
}

export async function getReservationById(id: string): Promise<ReservationDetail | null> {
    const row = await db.reservation.findUnique({
        where: { id },
        include: {
            customer: { select: { id: true, name: true, phone: true } },
            ticket: {
                select: {
                    id: true,
                    number: true,
                    intakeNote: true,
                    items: {
                        select: {
                            id: true,
                            name: true,
                            quantity: true,
                            unitPrice: true,
                            done: true,
                            productId: true,
                        },
                        orderBy: { sortOrder: "asc" },
                    },
                },
            },
        },
    });

    if (!row) return null;

    return {
        id: row.id,
        date: row.date,
        startMinutes: row.startMinutes,
        durationMinutes: row.durationMinutes,
        note: row.note,
        customerId: row.customer?.id ?? null,
        customerName: row.customerName ?? row.customer?.name ?? null,
        customerPhone: row.customer?.phone ?? null,
        bikeId: row.bikeId,
        bikeName: row.bikeName,
        ticketId: row.ticket?.id ?? null,
        ticketNumber: row.ticket?.number ?? null,
        ticket: row.ticket
            ? {
                  id: row.ticket.id,
                  number: row.ticket.number,
                  intakeNote: row.ticket.intakeNote,
                  items: row.ticket.items.map((item) => ({
                      id: item.id,
                      name: item.name,
                      quantity: item.quantity,
                      unitPrice: Number(item.unitPrice),
                      done: item.done,
                      productId: item.productId,
                  })),
              }
            : null,
    };
}
