"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isValidDateKey } from "@/lib/dates";
import { db } from "@/lib/db";

export async function saveOrder(formData: FormData) {
    const session = await auth();
    if (!session) redirect("/signin");

    const id = (formData.get("id") as string) || null;
    const name = ((formData.get("name") as string) ?? "").trim();
    const expectedAt = (formData.get("expectedAt") as string) ?? "";
    const note = ((formData.get("note") as string) ?? "").trim() || null;
    const customerId = (formData.get("customerId") as string) || null;

    if (!name || !isValidDateKey(expectedAt)) redirect("/orders");

    const customer = customerId
        ? await db.customer.findUnique({
              where: { id: customerId },
              select: { id: true, name: true },
          })
        : null;

    const data = {
        name,
        expectedAt,
        note,
        customerId: customer?.id ?? null,
        customerName: customer?.name ?? null,
    };

    if (id) {
        await db.order.update({ where: { id }, data });
    } else {
        await db.order.create({ data: { ...data, createdById: session.user.id } });
    }

    revalidatePath("/orders");
    revalidatePath("/customers");
    redirect("/orders");
}
