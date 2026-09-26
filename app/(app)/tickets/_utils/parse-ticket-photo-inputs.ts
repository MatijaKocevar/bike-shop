import type { TicketPhotoInput } from "../_types/ticket-photo-input";

const DRAFT_PREFIX = "tickets/draft/";

export function parseTicketPhotoInputs(raw: string | null): TicketPhotoInput[] {
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw) as { key?: string; description?: string }[];
        if (!Array.isArray(parsed)) return [];

        return parsed
            .filter(
                (photo): photo is { key: string; description?: string } =>
                    typeof photo?.key === "string" && photo.key.startsWith(DRAFT_PREFIX),
            )
            .map((photo) => ({
                key: photo.key,
                description: (photo.description ?? "").trim() || null,
            }));
    } catch {
        return [];
    }
}
