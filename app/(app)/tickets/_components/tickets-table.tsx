"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { DataTable } from "@/components/data-table";
import type { DataTableColumn, DataTableRow } from "@/components/data-table.types";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/money";
import type { TicketListItem } from "@/queries/tickets.types";

const STATUS_BADGE_VARIANT: Record<string, "default" | "secondary" | "outline" | "ghost"> = {
    NOVO: "default",
    V_DELU: "outline",
    KONCANO: "secondary",
    PREVZETO: "ghost",
};

type TicketsTableProps = {
    tickets: TicketListItem[];
    toolbarActions?: React.ReactNode;
};

export function TicketsTable({ tickets, toolbarActions }: TicketsTableProps) {
    const t = useTranslations("tickets");
    const tStatus = useTranslations("ticketStatus");
    const locale = useLocale();

    const columns: DataTableColumn[] = [
        { label: t("number"), className: "w-[7%]" },
        { label: t("customer"), filter: { type: "text" } },
        { label: t("bike"), filter: { type: "text" } },
        {
            label: t("status"),
            sortable: true,
            filter: {
                type: "select",
                key: "status",
                options: [
                    { value: "NOVO", label: tStatus("NOVO") },
                    { value: "V_DELU", label: tStatus("V_DELU") },
                    { value: "KONCANO", label: tStatus("KONCANO") },
                    { value: "PREVZETO", label: tStatus("PREVZETO") },
                ],
            },
            className: "w-[12%]",
        },
        { label: t("date"), sortable: true, filter: { type: "text" }, className: "w-[12%]" },
        { label: t("items"), sortable: true, className: "w-[7%]" },
        { label: t("total"), sortable: true, className: "w-[11%]" },
    ];

    const rows: DataTableRow[] = tickets.map((ticket) => {
        const customer = ticket.customerName ?? "—";
        const bike = ticket.bikeName ?? "—";
        const date = ticket.createdAt.toLocaleDateString(locale);

        return {
            key: ticket.id,
            href: `/tickets?id=${ticket.id}`,
            filterValues: { status: ticket.status },
            cells: [
                {
                    content: (
                        <Link
                            href={`/tickets?id=${ticket.id}`}
                            className="font-medium tabular-nums hover:underline"
                        >
                            {ticket.number}
                        </Link>
                    ),
                    search: String(ticket.number),
                    sort: ticket.number,
                },
                { content: customer, search: customer, sort: customer },
                { content: bike, className: "text-muted-foreground", search: bike, sort: bike },
                {
                    content: (
                        <Badge variant={STATUS_BADGE_VARIANT[ticket.status]}>
                            {tStatus(ticket.status)}
                        </Badge>
                    ),
                    search: tStatus(ticket.status),
                    sort: ticket.status,
                },
                {
                    content: date,
                    className: "text-muted-foreground",
                    search: date,
                    sort: ticket.createdAt.getTime(),
                },
                {
                    content: ticket.itemsCount,
                    search: String(ticket.itemsCount),
                    sort: ticket.itemsCount,
                },
                {
                    content: formatCurrency(ticket.total, "EUR", locale),
                    search: String(ticket.total),
                    sort: ticket.total,
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
                    {t("count", { count: tickets.length })}
                </span>
            }
            toolbarActions={toolbarActions}
            fill
        />
    );
}
