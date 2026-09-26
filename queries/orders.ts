import { db } from "@/lib/db";
import type { OrderListItem } from "@/queries/orders.types";

export async function listOrders(): Promise<OrderListItem[]> {
    const orders = await db.order.findMany({
        include: { customer: { select: { name: true } } },
        orderBy: { expectedAt: "asc" },
        take: 500,
    });

    return orders.map((order) => ({
        id: order.id,
        name: order.name,
        expectedAt: order.expectedAt,
        note: order.note,
        customerId: order.customerId,
        customerName: order.customer?.name ?? order.customerName,
    }));
}

export async function getOrderById(id: string): Promise<OrderListItem | null> {
    const order = await db.order.findUnique({ where: { id } });

    if (!order) return null;

    return {
        id: order.id,
        name: order.name,
        expectedAt: order.expectedAt,
        note: order.note,
        customerId: order.customerId,
        customerName: order.customerName,
    };
}
