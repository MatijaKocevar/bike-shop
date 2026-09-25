import { db } from "@/lib/db";
import type { UserListItem } from "@/queries/users.types";

export async function listUsers(): Promise<UserListItem[]> {
    const users = await db.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            _count: { select: { receipts: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 200,
    });

    return users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        receiptsCount: user._count.receipts,
    }));
}

export async function getUserById(id: string) {
    return db.user.findUnique({
        where: { id },
        include: { _count: { select: { receipts: true } } },
    });
}
