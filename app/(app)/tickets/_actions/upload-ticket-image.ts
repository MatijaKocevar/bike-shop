"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { CommitTicketImageArgs } from "../_types/commit-ticket-image";

export async function uploadTicketImage(args: CommitTicketImageArgs) {
    const { ticketId, key } = args;
    if (!ticketId || !key) return;
    if (!key.startsWith(`tickets/${ticketId}/`)) return;

    const count = await db.ticketImage.count({ where: { ticketId } });
    await db.ticketImage.create({
        data: { ticketId, key, sortOrder: count },
    });

    revalidatePath("/tickets");
}
