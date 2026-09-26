export type PushSubscriptionRecord = {
    id: string;
    endpoint: string;
    p256dh: string;
    auth: string;
    userId: string | null;
};
