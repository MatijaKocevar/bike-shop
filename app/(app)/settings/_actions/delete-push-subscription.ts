"use server";

import { db } from "@/lib/db";

export async function deletePushSubscription(endpoint: string) {
    if (!endpoint) return;

    await db.pushSubscription.deleteMany({ where: { endpoint } });
}
