"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { objectExists } from "@/lib/storage";
import type { CommitTicketImageArgs } from "../_types/commit-ticket-image";

export async function uploadTicketImage(args: CommitTicketImageArgs) {
    const { ticketId, key } = args;
    if (!ticketId || !key) return;

    if (!(await objectExists(key))) {
        throw new Error("Upload not found.");
    }

    const count = await db.ticketImage.count({ where: { ticketId } });
    await db.ticketImage.create({
        data: { ticketId, key, sortOrder: count },
    });

    revalidatePath("/tickets");
}
