"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export async function deleteReceipt(formData: FormData) {
    const id = formData.get("id") as string;

    if (id) {
        await db.receipt.delete({ where: { id } });
    }

    revalidatePath("/receipts");
    redirect("/receipts");
}
