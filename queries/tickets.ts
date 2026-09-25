import { db } from "@/lib/db";
import { round2 } from "@/lib/money";
import type { TicketDetail, TicketListItem } from "@/queries/tickets.types";

export async function listTickets(take = 300): Promise<TicketListItem[]> {
    const tickets = await db.ticket.findMany({
        include: {
            customer: { select: { name: true } },
            bike: { select: { name: true } },
            items: { select: { quantity: true, unitPrice: true } },
        },
        orderBy: { createdAt: "desc" },
        take,
    });

    return tickets.map((ticket) => ({
        id: ticket.id,
        number: ticket.number,
        status: ticket.status,
        customerName: ticket.customer?.name ?? null,
        bikeName: ticket.bike?.name ?? null,
        itemsCount: ticket.items.length,
        total: round2(
            ticket.items.reduce((sum, item) => sum + item.quantity * Number(item.unitPrice), 0),
        ),
        createdAt: ticket.createdAt,
    }));
}

export async function getTicketById(id: string): Promise<TicketDetail | null> {
    const ticket = await db.ticket.findUnique({
        where: { id },
        include: {
            customer: { select: { id: true, name: true, phone: true } },
            bike: { select: { id: true, name: true } },
            receipt: { select: { id: true, number: true } },
            items: { orderBy: { sortOrder: "asc" } },
        },
    });

    if (!ticket) return null;

    return {
        id: ticket.id,
        number: ticket.number,
        status: ticket.status,
        intakeNote: ticket.intakeNote,
        createdAt: ticket.createdAt,
        completedAt: ticket.completedAt,
        customerId: ticket.customer?.id ?? null,
        customerName: ticket.customer?.name ?? null,
        customerPhone: ticket.customer?.phone ?? null,
        bikeId: ticket.bike?.id ?? null,
        bikeName: ticket.bike?.name ?? null,
        receipt: ticket.receipt,
        items: ticket.items.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
            done: item.done,
            productId: item.productId,
        })),
        total: round2(
            ticket.items.reduce((sum, item) => sum + item.quantity * Number(item.unitPrice), 0),
        ),
    };
}

export async function countOpenTickets(): Promise<number> {
    return db.ticket.count({ where: { status: { not: "PREVZETO" } } });
}
