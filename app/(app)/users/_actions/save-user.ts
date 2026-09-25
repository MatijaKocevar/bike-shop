"use server";

import { revalidatePath } from "next/cache";
import type { Role } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";

export async function saveUser(formData: FormData) {
    const id = formData.get("id") as string;
    const name = (formData.get("name") as string)?.trim() || null;
    const email = (formData.get("email") as string)?.trim();
    const role = formData.get("role") as string;
    const password = formData.get("password") as string;
    const passwordConfirm = formData.get("passwordConfirm") as string;

    if (!id || !email) return;

    const passwordHash =
        password && password === passwordConfirm && password.length >= 8
            ? await hashPassword(password)
            : undefined;

    await db.user.update({
        where: { id },
        data: {
            name,
            email,
            role: role === "ADMIN" ? ("ADMIN" as Role) : ("STAFF" as Role),
            ...(passwordHash ? { passwordHash } : {}),
        },
    });

    revalidatePath("/users");
}
