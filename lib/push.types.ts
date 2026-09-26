export type PushPayload = {
    title: string;
    body: string;
    url: string;
};

export type PushResult = "sent" | "stale" | "failed";
