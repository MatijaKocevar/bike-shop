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

export async function updateReservation(formData: FormData) {
    const session = await auth();
    const id = formData.get("id") as string;
    if (!id) redirect("/calendar");

    const date = (formData.get("date") as string) ?? "";
    const startMinutes = parseTime((formData.get("time") as string) ?? "");
    const durationMinutes = Math.min(
        720,
        Math.max(15, Math.round(Number(formData.get("durationMinutes")) || 60)),
    );

    if (!isValidDateKey(date) || startMinutes === null) redirect("/calendar");

    const existing = await db.reservation.findUnique({
        where: { id },
        select: { ticketId: true },
    });
    if (!existing) redirect("/calendar");

    const customer = await resolveCustomer(formData);
    const note = (formData.get("note") as string)?.trim() || null;

    if (!customer) {
        await db.reservation.update({
            where: { id },
            data: {
                date,
                startMinutes,
                durationMinutes,
                note,
                customerId: null,
                customerName: null,
            },
        });

        revalidatePath("/calendar");
        revalidatePath("/");
        revalidatePath("/customers");
        redirect(`/calendar?month=${date.slice(0, 7)}`);
    }

    const entries = parseTicketEntries((formData.get("entries") as string) ?? "[]");

    await db.reservation.update({
        where: { id },
        data: {
            date,
            startMinutes,
            durationMinutes,
            note,
            customerId: customer.id,
            customerName: customer.name,
        },
    });

    let linkedTicketId = existing.ticketId;
    let linkedBike: { id: string; name: string } | null = null;
    let extras = entries;

    if (existing.ticketId && entries[0]) {
        const current = entries[0];
        const bike = await resolveBike(current, customer.id);
        const intakeNote = String(current.intakeNote ?? "").trim() || null;
        const items = parseTicketLines(JSON.stringify(current.items ?? []));

        await db.$transaction([
            db.ticketItem.deleteMany({ where: { ticketId: existing.ticketId } }),
            db.ticket.update({
                where: { id: existing.ticketId },
                data: {
                    intakeNote,
                    customerId: customer.id,
                    bikeId: bike?.id ?? null,
                    items: {
                        create: items.map((item, index) => ({
                            ...item,
                            sortOrder: index,
                        })),
                    },
                },
            }),
        ]);

        linkedBike = bike ? { id: bike.id, name: bike.name } : null;
        extras = entries.slice(1);
    } else if (!existing.ticketId && entries[0]) {
        const current = entries[0];
        const bike = await resolveBike(current, customer.id);
        const intakeNote = String(current.intakeNote ?? "").trim() || null;
        const items = parseTicketLines(JSON.stringify(current.items ?? []));
        const ticket = await db.ticket.create({
            data: {
                intakeNote,
                customerId: customer.id,
                bikeId: bike?.id ?? null,
                createdById: session?.user?.id ?? null,
                items: {
                    create: items.map((item, index) => ({ ...item, sortOrder: index })),
                },
            },
        });

        linkedTicketId = ticket.id;
        linkedBike = bike ? { id: bike.id, name: bike.name } : null;
        extras = entries.slice(1);
    } else if (existing.ticketId) {
        extras = entries.slice(1);
    }

    for (const entry of extras) {
        const bike = await resolveBike(entry, customer.id);
        if (!bike) continue;

        const intakeNote = String(entry.intakeNote ?? "").trim() || null;
        const items = parseTicketLines(JSON.stringify(entry.items ?? []));
        if (!intakeNote && items.length === 0) continue;

        const ticket = await db.ticket.create({
            data: {
                intakeNote,
                customerId: customer.id,
                bikeId: bike.id,
                createdById: session?.user?.id ?? null,
                items: {
                    create: items.map((item, index) => ({ ...item, sortOrder: index })),
                },
            },
        });

        linkedTicketId ??= ticket.id;
        linkedBike ??= { id: bike.id, name: bike.name };
    }

    if (!linkedTicketId) {
        const firstBike = entries[0] ? await resolveBike(entries[0], customer.id) : null;
        const ticket = await db.ticket.create({
            data: {
                customerId: customer.id,
                bikeId: firstBike?.id ?? null,
                createdById: session?.user?.id ?? null,
            },
        });

        linkedTicketId = ticket.id;
        linkedBike = firstBike ? { id: firstBike.id, name: firstBike.name } : null;
    }

    await db.reservation.update({
        where: { id },
        data: {
            ticketId: linkedTicketId,
            bikeId: linkedBike?.id ?? null,
            bikeName: linkedBike?.name ?? null,
        },
    });

    revalidatePath("/calendar");
    revalidatePath("/");
    revalidatePath("/customers");
    revalidatePath("/tickets");
    redirect(`/calendar?month=${date.slice(0, 7)}`);
}
