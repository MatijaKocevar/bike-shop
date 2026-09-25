"use server";

import { revalidatePath } from "next/cache";
import type { TicketStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db";

const STATUSES: TicketStatus[] = ["NOVO", "V_DELU", "KONCANO", "PREVZETO"];

export async function setTicketStatus(status: TicketStatus, formData: FormData) {
    const id = formData.get("id") as string;

    if (!id || !STATUSES.includes(status)) return;

    await db.ticket.update({
        where: { id },
        data: {
            status,
            completedAt: status === "KONCANO" || status === "PREVZETO" ? new Date() : null,
        },
    });

    revalidatePath("/tickets");
}
