"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export async function deleteReservation(formData: FormData) {
    const id = formData.get("id") as string;
    if (!id) redirect("/calendar");

    const reservation = await db.reservation.findUnique({
        where: { id },
        select: { date: true },
    });

    if (reservation) {
        await db.reservation.delete({ where: { id } });
    }

    revalidatePath("/calendar");
    revalidatePath("/");
    revalidatePath("/customers");
    redirect(reservation ? `/calendar?month=${reservation.date.slice(0, 7)}` : "/calendar");
}
