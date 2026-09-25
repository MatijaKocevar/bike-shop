import { db } from "@/lib/db";
import type { ProductListItem, ProductOption } from "@/queries/products.types";

export async function listProducts(): Promise<ProductListItem[]> {
    const products = await db.product.findMany({
        include: {
            category: { select: { name: true } },
            images: { select: { key: true, alt: true }, orderBy: { sortOrder: "asc" } },
        },
        orderBy: { name: "asc" },
    });

    return products.map((product) => ({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        currency: product.currency,
        active: product.active,
        category: product.category,
        images: product.images,
    }));
}

export async function getProductById(id: string) {
    const product = await db.product.findUnique({
        where: { id },
        include: { category: true, images: { orderBy: { sortOrder: "asc" } } },
    });

    if (!product) return null;

    return {
        ...product,
        price: Number(product.price),
    };
}

export async function listActiveProductOptions(): Promise<ProductOption[]> {
    const products = await db.product.findMany({
        where: { active: true },
        select: { id: true, name: true, price: true },
        orderBy: { name: "asc" },
    });

    return products.map((product) => ({
        id: product.id,
        name: product.name,
        price: Number(product.price),
    }));
}
