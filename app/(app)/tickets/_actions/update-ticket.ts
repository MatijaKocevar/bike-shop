"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseTicketEntries } from "@/lib/ticket-entries";
import { parseTicketLines } from "@/lib/ticket-lines";
import { resolveBike } from "../_utils/resolve-bike";

export async function updateTicket(formData: FormData) {
    const session = await auth();
    const ticketId = formData.get("id") as string;
    if (!ticketId) return;

    const ticket = await db.ticket.findUnique({
        where: { id: ticketId },
        select: { customerId: true },
    });
    if (!ticket) return;

    const entries = parseTicketEntries((formData.get("entries") as string) ?? "[]");
    const [current, ...extra] = entries;

    if (current) {
        const intakeNote = String(current.intakeNote ?? "").trim() || null;
        const items = parseTicketLines(JSON.stringify(current.items ?? []));

        await db.$transaction([
            db.ticketItem.deleteMany({ where: { ticketId } }),
            db.ticket.update({
                where: { id: ticketId },
                data: {
                    intakeNote,
                    items: {
                        create: items.map((item, index) => ({ ...item, sortOrder: index })),
                    },
                },
            }),
        ]);
    }

    if (ticket.customerId) {
        for (const entry of extra) {
            const bike = await resolveBike(entry, ticket.customerId);
            if (!bike) continue;

            const intakeNote = String(entry.intakeNote ?? "").trim() || null;
            const items = parseTicketLines(JSON.stringify(entry.items ?? []));
            if (!intakeNote && items.length === 0) continue;

            await db.ticket.create({
                data: {
                    intakeNote,
                    customerId: ticket.customerId,
                    bikeId: bike.id,
                    createdById: session?.user?.id ?? null,
                    items: {
                        create: items.map((item, index) => ({ ...item, sortOrder: index })),
                    },
                },
            });
        }
    }

    revalidatePath("/tickets");
    revalidatePath("/customers");
}
