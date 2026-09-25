"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { SETTINGS_KEYS } from "@/queries/settings";

export async function saveSettings(formData: FormData) {
    const entries = SETTINGS_KEYS.map((key) => ({
        key,
        value: String(formData.get(key) ?? "").trim(),
    }));

    await db.$transaction(
        entries.map((entry) =>
            db.setting.upsert({
                where: { key: entry.key },
                update: { value: entry.value },
                create: entry,
            }),
        ),
    );

    revalidatePath("/settings");
}
