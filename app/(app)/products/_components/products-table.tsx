"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { DataTable } from "@/components/data-table";
import type { DataTableColumn, DataTableRow } from "@/components/data-table.types";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatCurrency } from "@/lib/money";
import type { ProductListItem } from "@/queries/products.types";

type ProductsTableProps = {
    products: ProductListItem[];
    toolbarActions?: React.ReactNode;
};

export function ProductsTable({ products, toolbarActions }: ProductsTableProps) {
    const t = useTranslations("products");
    const tCommon = useTranslations("common");
    const locale = useLocale();

    const columns: DataTableColumn[] = [
        { label: tCommon("name"), filter: { type: "text" } },
        { label: tCommon("category"), filter: { type: "text" }, className: "w-[20%]" },
        { label: tCommon("price"), className: "w-[12%]" },
        { label: tCommon("active"), className: "w-[10%]" },
        { label: t("actions"), srOnly: true, className: "w-[16%]" },
    ];

    const rows: DataTableRow[] = products.map((product) => {
        const statusLabel = product.active ? tCommon("active") : tCommon("inactive");

        return {
            key: product.id,
            href: `/products?id=${product.id}`,
            cells: [
                {
                    content: (
                        <Link
                            href={`/products?id=${product.id}`}
                            className="font-medium hover:underline"
                        >
                            {product.name}
                        </Link>
                    ),
                    search: product.name,
                },
                {
                    content: product.category?.name ?? "—",
                    className: "text-muted-foreground",
                    search: product.category?.name ?? "",
                },
                {
                    content: formatCurrency(product.price, product.currency, locale),
                    search: String(product.price),
                },
                {
                    content: (
                        <Badge variant={product.active ? "default" : "secondary"}>
                            {statusLabel}
                        </Badge>
                    ),
                    search: statusLabel,
                },
                {
                    content: (
                        <div className="flex justify-end">
                            <Link
                                href={`/products?id=${product.id}`}
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
                    {t("count", { count: products.length })}
                </span>
            }
            toolbarActions={toolbarActions}
            fill
        />
    );
}
