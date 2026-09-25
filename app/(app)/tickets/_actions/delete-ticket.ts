"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export async function deleteTicket(formData: FormData) {
    const id = formData.get("id") as string;

    if (id) {
        await db.ticket.delete({ where: { id } });
    }

    revalidatePath("/tickets");
    redirect("/tickets");
}
