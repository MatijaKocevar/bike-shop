import { round2 } from "@/lib/money";
import type { ParsedTicketLine, TicketLineInput } from "@/lib/ticket-lines.types";

export function parseTicketLines(rawItems: string): ParsedTicketLine[] {
    let parsed: TicketLineInput[] = [];

    try {
        const value = JSON.parse(rawItems);
        if (Array.isArray(value)) parsed = value;
    } catch {
        parsed = [];
    }

    return parsed
        .map((item) => ({
            productId: item.productId || null,
            name: String(item.name ?? "").trim(),
            quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
            unitPrice: round2(Math.max(0, Number(item.unitPrice) || 0)),
            done: Boolean(item.done),
        }))
        .filter((item) => item.name);
}
