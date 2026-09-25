import type { Role } from "@/generated/prisma/enums";

export type UserListItem = {
    id: string;
    name: string | null;
    email: string | null;
    role: Role;
    createdAt: Date;
    receiptsCount: number;
};
