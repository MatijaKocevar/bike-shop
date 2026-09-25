"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { DiscountType } from "@/generated/prisma/enums";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { receiptTotals, round2 } from "@/lib/money";
import type { ReceiptLineInput } from "../_types/receipt-line-input";

function parseDiscountType(value: unknown): DiscountType | null {
    return value === "PERCENT" || value === "AMOUNT" ? value : null;
}

export async function createReceipt(formData: FormData) {
    const session = await auth();
    if (!session) redirect("/signin");

    const customerId = (formData.get("customerId") as string) || null;
    const newCustomerName = (formData.get("newCustomerName") as string)?.trim();
    const newCustomerPhone = (formData.get("newCustomerPhone") as string)?.trim() || null;
    const bikeId = (formData.get("bikeId") as string) || null;

    let customer = customerId ? await db.customer.findUnique({ where: { id: customerId } }) : null;
    if (!customer && newCustomerName) {
        customer = await db.customer.create({
            data: { name: newCustomerName, phone: newCustomerPhone },
        });
    }

    let bike = bikeId ? await db.bike.findUnique({ where: { id: bikeId } }) : null;
    if (bike && customer && bike.customerId !== customer.id) bike = null;

    const note = (formData.get("note") as string)?.trim() || null;
    const rawItems = (formData.get("items") as string) ?? "[]";

    let parsed: ReceiptLineInput[] = [];
    try {
        const value = JSON.parse(rawItems);
        if (Array.isArray(value)) parsed = value;
    } catch {
        parsed = [];
    }

    const items = parsed
        .map((item) => ({
            productId: item.productId || null,
            name: String(item.name ?? "").trim(),
            quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
            unitPrice: round2(Math.max(0, Number(item.unitPrice) || 0)),
            discountType: parseDiscountType(item.discountType),
            discountValue: round2(Math.max(0, Number(item.discountValue) || 0)),
        }))
        .filter((item) => item.name);

    if (items.length === 0) redirect("/receipts?new=1");

    const discountType = parseDiscountType(formData.get("discountType"));
    const discountValue = round2(Math.max(0, Number(formData.get("discountValue")) || 0));
    const totals = receiptTotals({ items, discountType, discountValue });

    const receipt = await db.receipt.create({
        data: {
            customerId: customer?.id ?? null,
            customerName: customer?.name ?? null,
            bikeId: bike?.id ?? null,
            bikeName: bike?.name ?? null,
            note,
            subtotal: totals.subtotal,
            discountType,
            discountValue,
            discountTotal: totals.discountTotal,
            total: totals.total,
            createdById: session.user.id,
            items: { create: items },
        },
    });

    revalidatePath("/receipts");
    revalidatePath("/customers");
    redirect(`/receipts?id=${receipt.id}`);
}
