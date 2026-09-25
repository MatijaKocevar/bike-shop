"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseTicketEntries } from "@/lib/ticket-entries";
import { parseTicketLines } from "@/lib/ticket-lines";
import { resolveBike } from "../_utils/resolve-bike";

async function resolveCustomer(formData: FormData) {
    const customerId = (formData.get("customerId") as string) || null;

    if (customerId) {
        return db.customer.findUnique({ where: { id: customerId } });
    }

    const name = (formData.get("newCustomerName") as string)?.trim();
    if (!name) return null;

    return db.customer.create({
        data: {
            name,
            phone: (formData.get("newCustomerPhone") as string)?.trim() || null,
        },
    });
}

export async function createTicket(formData: FormData) {
    const session = await auth();
    if (!session) redirect("/signin");

    const customer = await resolveCustomer(formData);
    if (!customer) redirect("/tickets?new=1");

    const entries = parseTicketEntries((formData.get("entries") as string) ?? "[]");
    const createdIds: string[] = [];

    for (const entry of entries) {
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
                createdById: session.user.id,
                items: {
                    create: items.map((item, index) => ({ ...item, sortOrder: index })),
                },
            },
        });

        createdIds.push(ticket.id);
    }

    if (createdIds.length === 0) redirect("/tickets?new=1");

    revalidatePath("/tickets");
    revalidatePath("/customers");
    redirect(createdIds.length === 1 ? `/tickets?id=${createdIds[0]}` : "/tickets");
}
