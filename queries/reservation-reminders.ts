import { db } from "@/lib/db";
import type { ReservationReminder } from "@/queries/reservation-reminders.types";

export async function listReservationReminderCandidates(
    startDate: string,
    endDate: string,
): Promise<ReservationReminder[]> {
    return db.reservation.findMany({
        where: { remindedAt: null, date: { gte: startDate, lte: endDate } },
        select: {
            id: true,
            date: true,
            startMinutes: true,
            customerName: true,
            bikeName: true,
        },
    });
}

export async function markReservationsReminded(ids: string[]) {
    if (ids.length === 0) return;

    await db.reservation.updateMany({
        where: { id: { in: ids } },
        data: { remindedAt: new Date() },
    });
}
