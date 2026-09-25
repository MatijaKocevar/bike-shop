"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isValidDateKey, parseTime } from "@/lib/dates";
import { db } from "@/lib/db";
import { parseTicketEntries } from "@/lib/ticket-entries";
import { parseTicketLines } from "@/lib/ticket-lines";
import { resolveBike } from "../_utils/resolve-bike";
import { resolveCustomer } from "../_utils/resolve-customer";

export async function createReservation(formData: FormData) {
    const session = await auth();
    if (!session) redirect("/signin");

    const date = (formData.get("date") as string) ?? "";
    const startMinutes = parseTime((formData.get("time") as string) ?? "");
    const durationMinutes = Math.min(
        720,
        Math.max(15, Math.round(Number(formData.get("durationMinutes")) || 60)),
    );

    if (!isValidDateKey(date) || startMinutes === null) redirect("/calendar");

    const customer = await resolveCustomer(formData);
    const entries = parseTicketEntries((formData.get("entries") as string) ?? "[]");
    const note = (formData.get("note") as string)?.trim() || null;

    const reservation = await db.reservation.create({
        data: {
            date,
            startMinutes,
            durationMinutes,
            note,
            customerId: customer?.id ?? null,
            customerName: customer?.name ?? null,
            createdById: session.user.id,
        },
    });

    let linkedTicketId: string | null = null;
    let linkedBike: { id: string; name: string } | null = null;

    for (const entry of entries) {
        const bike = customer ? await resolveBike(entry, customer.id) : null;
        if (!bike) continue;

        const intakeNote = String(entry.intakeNote ?? "").trim() || null;
        const items = parseTicketLines(JSON.stringify(entry.items ?? []));
        if (!intakeNote && items.length === 0) continue;

        const ticket = await db.ticket.create({
            data: {
                intakeNote,
                customerId: customer!.id,
                bikeId: bike.id,
                createdById: session.user.id,
                items: {
                    create: items.map((item, index) => ({ ...item, sortOrder: index })),
                },
            },
        });

        linkedTicketId ??= ticket.id;
        linkedBike ??= { id: bike.id, name: bike.name };
    }

    if (!linkedTicketId && customer) {
        const firstBike = entries[0] ? await resolveBike(entries[0], customer.id) : null;
        const ticket = await db.ticket.create({
            data: {
                customerId: customer.id,
                bikeId: firstBike?.id ?? null,
                createdById: session.user.id,
            },
        });

        linkedTicketId = ticket.id;
        linkedBike = firstBike ? { id: firstBike.id, name: firstBike.name } : null;
    }

    if (linkedTicketId) {
        await db.reservation.update({
            where: { id: reservation.id },
            data: {
                ticketId: linkedTicketId,
                bikeId: linkedBike?.id ?? null,
                bikeName: linkedBike?.name ?? null,
            },
        });
    }

    revalidatePath("/calendar");
    revalidatePath("/");
    revalidatePath("/customers");
    revalidatePath("/tickets");
    redirect(`/calendar?month=${date.slice(0, 7)}`);
}
