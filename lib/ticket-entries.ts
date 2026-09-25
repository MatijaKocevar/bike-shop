import type { TicketBikeEntry } from "@/lib/ticket-entries.types";

export function parseTicketEntries(raw: string): TicketBikeEntry[] {
    try {
        const value = JSON.parse(raw);
        if (Array.isArray(value)) return value;
    } catch {
        return [];
    }

    return [];
}
