"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export async function saveBike(formData: FormData) {
    const id = (formData.get("id") as string) || null;
    const customerId = formData.get("customerId") as string;
    const name = (formData.get("name") as string)?.trim();

    if (!customerId || !name) redirect("/customers");

    const data = {
        name,
        brand: (formData.get("brand") as string)?.trim() || null,
        model: (formData.get("model") as string)?.trim() || null,
        color: (formData.get("color") as string)?.trim() || null,
        serial: (formData.get("serial") as string)?.trim() || null,
        note: (formData.get("note") as string)?.trim() || null,
    };

    if (id) {
        await db.bike.update({ where: { id }, data });
    } else {
        await db.bike.create({ data: { customerId, ...data } });
    }

    revalidatePath("/customers");
    revalidatePath("/tickets");
    redirect(`/customers?id=${customerId}`);
}
