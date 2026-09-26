"use client";

import { useCallback, useEffect, useState } from "react";
import type { PushNotificationStatus } from "../_types/push-notification-status";
import { deletePushSubscription } from "../_actions/delete-push-subscription";
import { savePushSubscription } from "../_actions/save-push-subscription";
import { urlBase64ToUint8Array } from "../_utils/url-base64";

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function supportsPush() {
    return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

export function usePushNotifications() {
    const [status, setStatus] = useState<PushNotificationStatus>("loading");
    const [pending, setPending] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            if (!PUBLIC_KEY || !supportsPush()) {
                if (!cancelled) setStatus("unsupported");

                return;
            }

            const registration = await navigator.serviceWorker.register("/sw.js");
            const subscription = await registration.pushManager.getSubscription();

            if (!cancelled) setStatus(subscription ? "on" : "off");
        }

        load().catch(() => {
            if (!cancelled) setStatus("unsupported");
        });

        return () => {
            cancelled = true;
        };
    }, []);

    const enable = useCallback(async () => {
        setPending(true);

        try {
            const permission = await Notification.requestPermission();

            if (permission !== "granted") {
                setStatus(permission === "denied" ? "denied" : "off");

                return;
            }

            const registration = await navigator.serviceWorker.register("/sw.js");
            await navigator.serviceWorker.ready;

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY),
            });
            const json = subscription.toJSON();

            await savePushSubscription({
                endpoint: subscription.endpoint,
                p256dh: json.keys?.p256dh ?? "",
                auth: json.keys?.auth ?? "",
            });

            setStatus("on");
        } catch (error) {
            console.error("Enabling push notifications failed.", error);
            setStatus("off");
        } finally {
            setPending(false);
        }
    }, []);

    const disable = useCallback(async () => {
        setPending(true);

        try {
            const registration = await navigator.serviceWorker.register("/sw.js");
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                await deletePushSubscription(subscription.endpoint);
                await subscription.unsubscribe();
            }

            setStatus("off");
        } catch (error) {
            console.error("Disabling push notifications failed.", error);
        } finally {
            setPending(false);
        }
    }, []);

    return { status, pending, enable, disable };
}
