"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function removeProductImage(formData: FormData) {
    const id = formData.get("imageId") as string;

    if (id) {
        await db.productImage.delete({ where: { id } });
    }

    revalidatePath("/products");
}
