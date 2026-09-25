import { db } from "@/lib/db";
import type { ReceiptDetail, ReceiptListItem } from "@/queries/receipts.types";

export async function listReceipts(): Promise<ReceiptListItem[]> {
    const receipts = await db.receipt.findMany({
        include: { _count: { select: { items: true } } },
        orderBy: { createdAt: "desc" },
        take: 300,
    });

    return receipts.map((receipt) => ({
        id: receipt.id,
        number: receipt.number,
        customerName: receipt.customerName,
        status: receipt.status,
        currency: receipt.currency,
        total: Number(receipt.total),
        itemsCount: receipt._count.items,
        createdAt: receipt.createdAt,
    }));
}

export async function getReceiptById(id: string): Promise<ReceiptDetail | null> {
    const receipt = await db.receipt.findUnique({
        where: { id },
        include: {
            createdBy: { select: { name: true, email: true } },
            ticket: { select: { id: true, number: true } },
            items: { orderBy: { id: "asc" } },
        },
    });

    if (!receipt) return null;

    return {
        id: receipt.id,
        number: receipt.number,
        customerName: receipt.customerName,
        bikeName: receipt.bikeName,
        note: receipt.note,
        status: receipt.status,
        currency: receipt.currency,
        subtotal: Number(receipt.subtotal),
        discountType: receipt.discountType,
        discountValue: Number(receipt.discountValue),
        discountTotal: Number(receipt.discountTotal),
        total: Number(receipt.total),
        createdAt: receipt.createdAt,
        customerId: receipt.customerId,
        createdBy: receipt.createdBy,
        ticket: receipt.ticket,
        items: receipt.items.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
            discountType: item.discountType,
            discountValue: Number(item.discountValue),
            productId: item.productId,
        })),
    };
}
