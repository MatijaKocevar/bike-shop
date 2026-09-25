"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { receiptTotals } from "@/lib/money";

export async function convertTicketToReceipt(formData: FormData) {
    const session = await auth();
    if (!session) redirect("/signin");

    const id = formData.get("id") as string;
    if (!id) redirect("/tickets");

    const ticket = await db.ticket.findUnique({
        where: { id },
        include: {
            customer: { select: { id: true, name: true } },
            bike: { select: { id: true, name: true } },
            items: { orderBy: { sortOrder: "asc" } },
        },
    });

    if (!ticket || ticket.receiptId) redirect(`/tickets/${id}`);

    const doneItems = ticket.items.filter((item) => item.done);
    const items = doneItems.length > 0 ? doneItems : ticket.items;

    if (items.length === 0) redirect(`/tickets/${id}`);

    const totals = receiptTotals({
        items: items.map((item) => ({
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
            discountType: null,
            discountValue: 0,
        })),
        discountType: null,
        discountValue: 0,
    });

    const receipt = await db.receipt.create({
        data: {
            customerId: ticket.customer?.id ?? null,
            customerName: ticket.customer?.name ?? null,
            bikeId: ticket.bike?.id ?? null,
            bikeName: ticket.bike?.name ?? null,
            subtotal: totals.subtotal,
            total: totals.total,
            createdById: session.user.id,
            items: {
                create: items.map((item) => ({
                    productId: item.productId,
                    name: item.name,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                })),
            },
        },
    });

    await db.ticket.update({
        where: { id: ticket.id },
        data: { receiptId: receipt.id, status: "KONCANO", completedAt: new Date() },
    });

    revalidatePath("/tickets");
    revalidatePath("/receipts");
    revalidatePath("/customers");
    redirect(`/receipts?id=${receipt.id}`);
}
