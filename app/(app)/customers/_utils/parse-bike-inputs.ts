import type { BikeInput } from "../_types/bike-input";

export function parseBikeInputs(raw: string | null): BikeInput[] {
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw) as { name?: string; color?: string }[];
        if (!Array.isArray(parsed)) return [];

        return parsed
            .map((bike) => ({
                name: (bike.name ?? "").trim(),
                color: (bike.color ?? "").trim() || null,
            }))
            .filter((bike) => bike.name !== "");
    } catch {
        return [];
    }
}
