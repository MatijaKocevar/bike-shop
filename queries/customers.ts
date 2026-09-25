import { db } from "@/lib/db";
import type { CustomerDetail, CustomerListItem, CustomerOption } from "@/queries/customers.types";

export async function listCustomers(): Promise<CustomerListItem[]> {
    const customers = await db.customer.findMany({
        select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            createdAt: true,
            _count: { select: { bikes: true, tickets: true, receipts: true } },
        },
        orderBy: { name: "asc" },
        take: 500,
    });

    return customers.map((customer) => ({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        bikesCount: customer._count.bikes,
        ticketsCount: customer._count.tickets,
        receiptsCount: customer._count.receipts,
        createdAt: customer.createdAt,
    }));
}

export async function listCustomerOptions(): Promise<CustomerOption[]> {
    return db.customer.findMany({
        select: { id: true, name: true, phone: true },
        orderBy: { name: "asc" },
        take: 500,
    });
}

export async function getCustomerById(id: string): Promise<CustomerDetail | null> {
    const customer = await db.customer.findUnique({
        where: { id },
        include: {
            bikes: { orderBy: { createdAt: "asc" } },
            tickets: {
                select: {
                    id: true,
                    number: true,
                    status: true,
                    createdAt: true,
                    _count: { select: { items: true } },
                },
                orderBy: { createdAt: "desc" },
            },
            receipts: {
                select: { id: true, number: true, status: true, total: true, createdAt: true },
                orderBy: { createdAt: "desc" },
            },
            reservations: {
                select: {
                    id: true,
                    date: true,
                    startMinutes: true,
                    durationMinutes: true,
                    note: true,
                },
                orderBy: [{ date: "desc" }, { startMinutes: "desc" }],
                take: 20,
            },
        },
    });

    if (!customer) return null;

    return {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        note: customer.note,
        bikes: customer.bikes.map((bike) => ({
            id: bike.id,
            name: bike.name,
            brand: bike.brand,
            model: bike.model,
            color: bike.color,
            serial: bike.serial,
            note: bike.note,
        })),
        tickets: customer.tickets.map((ticket) => ({
            id: ticket.id,
            number: ticket.number,
            status: ticket.status,
            itemsCount: ticket._count.items,
            createdAt: ticket.createdAt,
        })),
        receipts: customer.receipts.map((receipt) => ({
            id: receipt.id,
            number: receipt.number,
            status: receipt.status,
            total: Number(receipt.total),
            createdAt: receipt.createdAt,
        })),
        reservations: customer.reservations.map((reservation) => ({
            id: reservation.id,
            date: reservation.date,
            startMinutes: reservation.startMinutes,
            durationMinutes: reservation.durationMinutes,
            note: reservation.note,
        })),
    };
}
