"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function removeTicketImage(imageId: string) {
    if (!imageId) return;

    await db.ticketImage.delete({ where: { id: imageId } });

    revalidatePath("/tickets");
}
