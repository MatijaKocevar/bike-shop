"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { DataTable } from "@/components/data-table";
import type { DataTableColumn, DataTableRow } from "@/components/data-table.types";
import { buttonVariants } from "@/components/ui/button";
import type { CustomerListItem } from "@/queries/customers.types";

type CustomersTableProps = {
    customers: CustomerListItem[];
    toolbarActions?: React.ReactNode;
};

export function CustomersTable({ customers, toolbarActions }: CustomersTableProps) {
    const t = useTranslations("customers");

    const columns: DataTableColumn[] = [
        { label: t("name"), filter: { type: "text" } },
        { label: t("phone"), filter: { type: "text" }, className: "w-[15%]" },
        { label: t("email"), filter: { type: "text" }, className: "w-[20%]" },
        { label: t("bikes"), sortable: true, className: "w-[9%]" },
        { label: t("tickets"), sortable: true, className: "w-[9%]" },
        { label: t("receipts"), sortable: true, className: "w-[9%]" },
        { label: t("actions"), srOnly: true, className: "w-[12%]" },
    ];

    const rows: DataTableRow[] = customers.map((customer) => ({
        key: customer.id,
        href: `/customers?id=${customer.id}`,
        cells: [
            {
                content: (
                    <Link
                        href={`/customers?id=${customer.id}`}
                        className="font-medium hover:underline"
                    >
                        {customer.name}
                    </Link>
                ),
                search: customer.name,
                sort: customer.name,
            },
            {
                content: customer.phone ?? "—",
                className: "text-muted-foreground",
                search: customer.phone ?? "",
            },
            {
                content: customer.email ?? "—",
                className: "text-muted-foreground",
                search: customer.email ?? "",
            },
            {
                content: customer.bikesCount,
                search: String(customer.bikesCount),
                sort: customer.bikesCount,
            },
            {
                content: customer.ticketsCount,
                search: String(customer.ticketsCount),
                sort: customer.ticketsCount,
            },
            {
                content: customer.receiptsCount,
                search: String(customer.receiptsCount),
                sort: customer.receiptsCount,
            },
            {
                content: (
                    <div className="flex justify-end">
                        <Link
                            href={`/customers?id=${customer.id}&edit=1`}
                            aria-label={t("edit")}
                            className={buttonVariants({ variant: "outline", size: "sm" })}
                        >
                            <Pencil className="size-4" />
                            <span className="hidden sm:inline">{t("edit")}</span>
                        </Link>
                    </div>
                ),
            },
        ],
    }));

    return (
        <DataTable
            columns={columns}
            rows={rows}
            counter={
                <span className="text-xs text-muted-foreground">
                    {t("count", { count: customers.length })}
                </span>
            }
            toolbarActions={toolbarActions}
            fill
        />
    );
}
