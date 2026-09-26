"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function updateTicketImage(imageId: string, description: string) {
    if (!imageId) return;

    await db.ticketImage.update({
        where: { id: imageId },
        data: { description: description || null },
    });

    revalidatePath("/tickets");
}
