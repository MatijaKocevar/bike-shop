"use server";

import { revalidatePath } from "next/cache";
import type { Role } from "@/generated/prisma/enums";
import { db } from "@/lib/db";

export async function updateUserRole(formData: FormData) {
    const id = formData.get("id") as string;
    const role = formData.get("role") as string;

    if (id && (role === "STAFF" || role === "ADMIN")) {
        await db.user.update({
            where: { id },
            data: { role: role as Role },
        });
    }

    revalidatePath("/users");
}
