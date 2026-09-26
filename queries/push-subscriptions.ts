import { db } from "@/lib/db";
import type { PushSubscriptionRecord } from "@/queries/push-subscriptions.types";

export async function listPushSubscriptions(): Promise<PushSubscriptionRecord[]> {
    return db.pushSubscription.findMany({
        select: { id: true, endpoint: true, p256dh: true, auth: true, userId: true },
        orderBy: { createdAt: "asc" },
    });
}

export async function deletePushSubscriptions(ids: string[]) {
    if (ids.length === 0) return;

    await db.pushSubscription.deleteMany({ where: { id: { in: ids } } });
}
