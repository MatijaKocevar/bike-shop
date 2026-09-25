import type { TicketLineInput } from "@/lib/ticket-lines.types";

export type TicketBikeEntry = {
    bikeId?: string | null;
    newBike?: {
        name?: string;
        brand?: string;
        model?: string;
        color?: string;
        serial?: string;
    } | null;
    intakeNote?: string;
    items?: TicketLineInput[];
};
