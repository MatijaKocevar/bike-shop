import webpush from "web-push";
import type { PushPayload, PushResult } from "@/lib/push.types";
import type { PushSubscriptionRecord } from "@/queries/push-subscriptions.types";

let configured = false;

function ensureConfigured(): boolean {
    if (configured) return true;

    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT;

    if (!publicKey || !privateKey || !subject) {
        console.warn("Push notifications disabled: missing VAPID environment variables.");

        return false;
    }

    webpush.setVapidDetails(subject, publicKey, privateKey);
    configured = true;

    return true;
}

export async function sendPush(
    subscription: PushSubscriptionRecord,
    payload: PushPayload,
): Promise<PushResult> {
    if (!ensureConfigured()) return "failed";

    try {
        await webpush.sendNotification(
            {
                endpoint: subscription.endpoint,
                keys: { p256dh: subscription.p256dh, auth: subscription.auth },
            },
            JSON.stringify(payload),
        );

        return "sent";
    } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) return "stale";

        console.error("Push notification failed.", error);

        return "failed";
    }
}
