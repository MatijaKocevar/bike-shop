"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { DataTable } from "@/components/data-table";
import type { DataTableColumn, DataTableRow } from "@/components/data-table.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UserListItem } from "@/queries/users.types";
import { deleteUser } from "../_actions/delete-user";
import { updateUserRole } from "../_actions/update-user-role";

const selectClass =
    "rounded-md border bg-background px-2 py-1 text-xs focus-visible:ring-2 focus-visible:ring-ring/50 outline-none";

type UsersTableProps = {
    users: UserListItem[];
};

export function UsersTable({ users }: UsersTableProps) {
    const t = useTranslations("users");
    const tCommon = useTranslations("common");
    const tRole = useTranslations("role");
    const locale = useLocale();

    const columns: DataTableColumn[] = [
        { label: t("name"), sortable: true, filter: { type: "text" } },
        { label: t("email"), sortable: true, filter: { type: "text" } },
        {
            label: t("role"),
            sortable: true,
            filter: {
                type: "select",
                key: "role",
                options: [
                    { value: "STAFF", label: tRole("STAFF") },
                    { value: "ADMIN", label: tRole("ADMIN") },
                ],
            },
        },
        { label: t("receipts"), sortable: true, className: "w-[10%]" },
        { label: t("joined"), sortable: true, filter: { type: "text" }, className: "w-[14%]" },
        { label: t("actions"), className: "w-[22%]" },
    ];

    const rows: DataTableRow[] = users.map((user) => {
        const name = user.name ?? "";
        const email = user.email ?? "";
        const joined = user.createdAt.toLocaleDateString(locale);

        return {
            key: user.id,
            href: `/users?id=${user.id}`,
            filterValues: { role: user.role },
            cells: [
                {
                    content: (
                        <Link href={`/users?id=${user.id}`} className="font-medium hover:underline">
                            {user.name ?? "—"}
                        </Link>
                    ),
                    search: name,
                    sort: name,
                },
                {
                    content: user.email ?? "—",
                    className: "text-muted-foreground",
                    search: email,
                    sort: email,
                },
                {
                    content: (
                        <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                            {tRole(user.role)}
                        </Badge>
                    ),
                    search: tRole(user.role),
                    sort: user.role,
                },
                {
                    content: user.receiptsCount,
                    search: String(user.receiptsCount),
                    sort: user.receiptsCount,
                },
                {
                    content: joined,
                    className: "text-muted-foreground",
                    search: joined,
                    sort: user.createdAt.getTime(),
                },
                {
                    content: (
                        <div className="flex items-center gap-1">
                            <form action={updateUserRole} className="flex items-center gap-1">
                                <input type="hidden" name="id" value={user.id} />
                                <select
                                    className={selectClass}
                                    name="role"
                                    defaultValue={user.role}
                                >
                                    <option value="STAFF">{tRole("STAFF")}</option>
                                    <option value="ADMIN">{tRole("ADMIN")}</option>
                                </select>
                                <Button type="submit" variant="outline" size="sm">
                                    {tCommon("set")}
                                </Button>
                            </form>
                            <form action={deleteUser}>
                                <input type="hidden" name="id" value={user.id} />
                                <Button type="submit" variant="ghost" size="icon">
                                    <Trash2 className="size-4" />
                                    <span className="sr-only">{t("deleteUser")}</span>
                                </Button>
                            </form>
                        </div>
                    ),
                },
            ],
        };
    });

    return (
        <DataTable
            columns={columns}
            rows={rows}
            counter={
                <span className="text-xs text-muted-foreground">
                    {t("count", { count: users.length })}
                </span>
            }
            fill
        />
    );
}
