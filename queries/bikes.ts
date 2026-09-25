import { db } from "@/lib/db";
import type { BikeOption } from "@/queries/bikes.types";

export async function listBikeOptions(): Promise<BikeOption[]> {
    const bikes = await db.bike.findMany({
        select: { id: true, customerId: true, name: true, brand: true, model: true },
        orderBy: [{ customerId: "asc" }, { name: "asc" }],
        take: 1000,
    });

    return bikes;
}
