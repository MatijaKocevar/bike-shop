"use server";

import { revalidatePath } from "next/cache";
import type { ReceiptStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db";

const STATUSES: ReceiptStatus[] = ["ISSUED", "PAID", "CANCELLED"];

export async function updateReceiptStatus(formData: FormData) {
    const id = formData.get("id") as string;
    const status = formData.get("status") as string;

    if (!id || !STATUSES.includes(status as ReceiptStatus)) return;

    const receipt = await db.receipt.update({
        where: { id },
        data: { status: status as ReceiptStatus },
        select: { ticket: { select: { id: true } } },
    });

    if (status === "PAID" && receipt.ticket) {
        await db.ticket.update({
            where: { id: receipt.ticket.id },
            data: { status: "PREVZETO", completedAt: new Date() },
        });

        revalidatePath("/tickets");
        revalidatePath("/tickets");
    }

    revalidatePath("/receipts");
    revalidatePath("/receipts");
    revalidatePath("/customers");
}
