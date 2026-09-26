"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { DataTable } from "@/components/data-table";
import type { DataTableColumn, DataTableRow } from "@/components/data-table.types";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { parseDateKey, todayKey } from "@/lib/dates";
import type { OrderListItem } from "@/queries/orders.types";

type OrdersTableProps = {
    orders: OrderListItem[];
    toolbarActions?: React.ReactNode;
};

export function OrdersTable({ orders, toolbarActions }: OrdersTableProps) {
    const t = useTranslations("orders");
    const locale = useLocale();
    const today = todayKey();

    const columns: DataTableColumn[] = [
        { label: t("customer"), filter: { type: "text" } },
        { label: t("name"), filter: { type: "text" } },
        { label: t("expectedAt"), sortable: true, className: "w-[18%]" },
        { label: t("actions"), srOnly: true, className: "w-[12%]" },
    ];

    const rows: DataTableRow[] = orders.map((order) => {
        const { year, month, day } = parseDateKey(order.expectedAt);
        const dateLabel = new Date(year, month - 1, day).toLocaleDateString(locale);
        const overdue = order.expectedAt < today;
        const customer = order.customerName ?? t("noCustomer");

        return {
            key: order.id,
            href: `/orders?id=${order.id}`,
            cells: [
                {
                    content: order.customerId ? (
                        <Link
                            href={`/customers?id=${order.customerId}`}
                            className="text-muted-foreground hover:underline"
                        >
                            {customer}
                        </Link>
                    ) : (
                        <span className="text-muted-foreground">{customer}</span>
                    ),
                    search: customer,
                    sort: customer,
                },
                {
                    content: (
                        <Link
                            href={`/orders?id=${order.id}`}
                            className="font-medium hover:underline"
                        >
                            {order.name}
                        </Link>
                    ),
                    search: order.name,
                    sort: order.name,
                },
                {
                    content: (
                        <span className="flex items-center gap-2">
                            <span
                                className={
                                    overdue
                                        ? "font-medium text-destructive tabular-nums"
                                        : "tabular-nums"
                                }
                            >
                                {dateLabel}
                            </span>
                            {overdue && <Badge variant="destructive">{t("overdue")}</Badge>}
                        </span>
                    ),
                    search: dateLabel,
                    sort: order.expectedAt,
                },
                {
                    content: (
                        <div className="flex justify-end">
                            <Link
                                href={`/orders?id=${order.id}`}
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
        };
    });

    return (
        <DataTable
            columns={columns}
            rows={rows}
            counter={
                <span className="text-xs text-muted-foreground">
                    {t("count", { count: orders.length })}
                </span>
            }
            toolbarActions={toolbarActions}
            fill
        />
    );
}
