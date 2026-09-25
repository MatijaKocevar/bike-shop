"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export async function deleteCustomer(formData: FormData) {
    const id = formData.get("id") as string;

    if (id) {
        await db.customer.delete({ where: { id } });
    }

    revalidatePath("/customers");
    redirect("/customers");
}
