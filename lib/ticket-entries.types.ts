import type { TicketLineInput } from "@/lib/ticket-lines.types";

export type TicketBikeEntry = {
    bikeId?: string | null;
    newBike?: {
        name?: string;
        color?: string;
    } | null;
    intakeNote?: string;
    items?: TicketLineInput[];
};
