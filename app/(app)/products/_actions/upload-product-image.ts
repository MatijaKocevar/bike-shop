"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { CommitProductImageArgs } from "../_types/commit-product-image";

export async function uploadProductImage(args: CommitProductImageArgs) {
    const { productId, key, alt } = args;
    if (!productId || !key) return;
    if (!key.startsWith(`products/${productId}/`)) return;

    const count = await db.productImage.count({ where: { productId } });
    await db.productImage.create({
        data: { productId, key, alt, sortOrder: count },
    });

    revalidatePath("/products");
}
