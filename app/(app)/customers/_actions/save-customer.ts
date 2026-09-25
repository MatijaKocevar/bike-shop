"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export async function saveCustomer(formData: FormData) {
    const id = (formData.get("id") as string) || null;
    const name = (formData.get("name") as string)?.trim();
    const phone = (formData.get("phone") as string)?.trim() || null;
    const email = (formData.get("email") as string)?.trim() || null;
    const note = (formData.get("note") as string)?.trim() || null;

    if (!name) redirect("/customers");

    const returnTo = (formData.get("returnTo") as string) || "/customers";
    const data = { name, phone, email, note };

    if (id) {
        await db.customer.update({ where: { id }, data });
    } else {
        await db.customer.create({ data });
    }

    revalidatePath("/customers");
    revalidatePath("/tickets");
    redirect(returnTo);
}
