import { db } from "@/lib/db";
import type { TicketBikeEntry } from "@/lib/ticket-entries.types";

export async function resolveBike(entry: TicketBikeEntry, customerId: string) {
    if (entry.bikeId) {
        const bike = await db.bike.findUnique({ where: { id: entry.bikeId } });

        return bike && bike.customerId === customerId ? bike : null;
    }

    const name = entry.newBike?.name?.trim();
    if (!name) return null;

    return db.bike.create({
        data: {
            customerId,
            name,
            color: entry.newBike?.color?.trim() || null,
        },
    });
}
