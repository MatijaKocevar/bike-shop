"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export async function deleteOrder(formData: FormData) {
    const id = formData.get("id") as string;

    if (id) {
        await db.order.delete({ where: { id } });
    }

    revalidatePath("/orders");
    revalidatePath("/customers");
    redirect("/orders");
}
