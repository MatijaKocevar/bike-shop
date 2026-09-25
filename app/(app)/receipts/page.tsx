import Link from "next/link";
import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { FormDialog } from "@/components/form-dialog";
import { buttonVariants } from "@/components/ui/button";
import { listBikeOptions } from "@/queries/bikes";
import { listCustomerOptions } from "@/queries/customers";
import { listActiveProductOptions } from "@/queries/products";
import { getReceiptById, listReceipts } from "@/queries/receipts";
import { getShopSettings } from "@/queries/settings";
import { ReceiptDetail } from "./_components/receipt-detail";
import { ReceiptForm } from "./_components/receipt-form";
import { ReceiptsTable } from "./_components/receipts-table";

type ReceiptsPageProps = {
    searchParams: Promise<{ id?: string; new?: string }>;
};

export default async function ReceiptsPage({ searchParams }: ReceiptsPageProps) {
    const { id, new: isNew } = await searchParams;
    const [receipts, customers, bikes, products, editing, settings] = await Promise.all([
        listReceipts(),
        listCustomerOptions(),
        listBikeOptions(),
        listActiveProductOptions(),
        id ? getReceiptById(id) : null,
        id ? getShopSettings() : null,
    ]);
    const t = await getTranslations("receipts");

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div
                className={
                    editing
                        ? "flex min-h-0 flex-1 flex-col print:hidden"
                        : "flex min-h-0 flex-1 flex-col"
                }
            >
                <ReceiptsTable
                    receipts={receipts}
                    toolbarActions={
                        <Link
                            href="/receipts?new=1"
                            aria-label={t("new")}
                            className={buttonVariants({ size: "sm" })}
                        >
                            <Plus className="size-4" />
                            <span className="hidden sm:inline">{t("new")}</span>
                        </Link>
                    }
                />
            </div>

            <FormDialog
                open={Boolean(isNew)}
                onCloseHref="/receipts"
                title={t("newTitle")}
                className="sm:h-[90dvh] sm:max-w-5xl"
            >
                {isNew ? (
                    <ReceiptForm customers={customers} bikes={bikes} products={products} />
                ) : null}
            </FormDialog>

            <FormDialog
                open={Boolean(editing)}
                onCloseHref="/receipts"
                title={editing ? `${t("title")} · ${t("number")} ${editing.number}` : undefined}
                className="overflow-y-auto sm:h-[90dvh] sm:max-w-3xl print:static print:h-auto print:max-h-none print:w-full print:max-w-none print:translate-x-0 print:translate-y-0 print:overflow-visible print:rounded-none print:bg-transparent print:p-0 print:ring-0"
            >
                {editing && settings ? (
                    <ReceiptDetail receipt={editing} settings={settings} />
                ) : null}
            </FormDialog>
        </div>
    );
}
