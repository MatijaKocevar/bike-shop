"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function deleteBike(formData: FormData) {
    const id = formData.get("id") as string;

    if (id) {
        await db.bike.delete({ where: { id } });
    }

    revalidatePath("/customers");
}
