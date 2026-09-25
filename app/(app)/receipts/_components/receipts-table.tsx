"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { DataTable } from "@/components/data-table";
import type { DataTableColumn, DataTableRow } from "@/components/data-table.types";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatCurrency } from "@/lib/money";
import type { ReceiptListItem } from "@/queries/receipts.types";

const STATUS_BADGE_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
    ISSUED: "secondary",
    PAID: "default",
    CANCELLED: "destructive",
};

type ReceiptsTableProps = {
    receipts: ReceiptListItem[];
    toolbarActions?: React.ReactNode;
};

export function ReceiptsTable({ receipts, toolbarActions }: ReceiptsTableProps) {
    const t = useTranslations("receipts");
    const tStatus = useTranslations("receiptStatus");
    const locale = useLocale();

    const columns: DataTableColumn[] = [
        { label: t("number"), className: "w-[8%]" },
        { label: t("customer"), filter: { type: "text" } },
        {
            label: t("status"),
            sortable: true,
            filter: {
                type: "select",
                key: "status",
                options: [
                    { value: "ISSUED", label: tStatus("ISSUED") },
                    { value: "PAID", label: tStatus("PAID") },
                    { value: "CANCELLED", label: tStatus("CANCELLED") },
                ],
            },
            className: "w-[12%]",
        },
        { label: t("date"), sortable: true, filter: { type: "text" }, className: "w-[14%]" },
        { label: t("items"), sortable: true, className: "w-[8%]" },
        { label: t("total"), sortable: true, className: "w-[12%]" },
        { label: t("print"), srOnly: true, className: "w-[10%]" },
    ];

    const rows: DataTableRow[] = receipts.map((receipt) => {
        const customer = receipt.customerName ?? t("walkIn");
        const date = receipt.createdAt.toLocaleDateString(locale);

        return {
            key: receipt.id,
            href: `/receipts?id=${receipt.id}`,
            filterValues: { status: receipt.status },
            cells: [
                {
                    content: (
                        <Link
                            href={`/receipts?id=${receipt.id}`}
                            className="font-medium tabular-nums hover:underline"
                        >
                            {receipt.number}
                        </Link>
                    ),
                    search: String(receipt.number),
                    sort: receipt.number,
                },
                {
                    content: customer,
                    search: customer,
                    sort: customer,
                },
                {
                    content: (
                        <Badge variant={STATUS_BADGE_VARIANT[receipt.status]}>
                            {tStatus(receipt.status)}
                        </Badge>
                    ),
                    search: tStatus(receipt.status),
                    sort: receipt.status,
                },
                {
                    content: date,
                    className: "text-muted-foreground",
                    search: date,
                    sort: receipt.createdAt.getTime(),
                },
                {
                    content: receipt.itemsCount,
                    search: String(receipt.itemsCount),
                    sort: receipt.itemsCount,
                },
                {
                    content: formatCurrency(receipt.total, receipt.currency, locale),
                    search: String(receipt.total),
                    sort: receipt.total,
                },
                {
                    content: (
                        <div className="flex justify-end">
                            <Link
                                href={`/receipts?id=${receipt.id}`}
                                className={buttonVariants({ variant: "outline", size: "sm" })}
                            >
                                {t("print")}
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
                    {t("count", { count: receipts.length })}
                </span>
            }
            toolbarActions={toolbarActions}
            fill
        />
    );
}
