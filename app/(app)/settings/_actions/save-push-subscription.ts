"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { PushSubscriptionInput } from "../_types/push-subscription-input";

export async function savePushSubscription(input: PushSubscriptionInput) {
    const session = await auth();
    if (!session) return;
    if (!input.endpoint || !input.p256dh || !input.auth) return;

    await db.pushSubscription.upsert({
        where: { endpoint: input.endpoint },
        update: { p256dh: input.p256dh, auth: input.auth, userId: session.user.id },
        create: {
            endpoint: input.endpoint,
            p256dh: input.p256dh,
            auth: input.auth,
            userId: session.user.id,
        },
    });
}
