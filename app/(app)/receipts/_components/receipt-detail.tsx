import Link from "next/link";
import { Download, Trash2 } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { discountAmount, formatCurrency } from "@/lib/money";
import type { ReceiptDetail as ReceiptDetailData } from "@/queries/receipts.types";
import type { ShopSettings } from "@/queries/settings.types";
import { deleteReceipt } from "../_actions/delete-receipt";
import { updateReceiptStatus } from "../_actions/update-receipt-status";
import { PrintButton } from "./print-button";

const STATUS_BADGE_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
    ISSUED: "secondary",
    PAID: "default",
    CANCELLED: "destructive",
};

type ReceiptDetailProps = {
    receipt: ReceiptDetailData;
    settings: ShopSettings;
};

export async function ReceiptDetail({ receipt, settings }: ReceiptDetailProps) {
    const t = await getTranslations("receipts");
    const tStatus = await getTranslations("receiptStatus");
    const locale = await getLocale();
    const date = receipt.createdAt.toLocaleDateString(locale);
    const hasDiscount = receipt.discountTotal > 0;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-end gap-2 print:hidden">
                <PrintButton />

                <a
                    href={`/api/receipts/${receipt.id}/pdf`}
                    className={buttonVariants({ variant: "outline", size: "default" })}
                >
                    <Download className="size-4" />
                    {t("downloadPdf")}
                </a>

                {receipt.status !== "PAID" && (
                    <form action={updateReceiptStatus}>
                        <input type="hidden" name="id" value={receipt.id} />
                        <input type="hidden" name="status" value="PAID" />
                        <Button type="submit">{t("markPaid")}</Button>
                    </form>
                )}

                {receipt.status === "PAID" && (
                    <form action={updateReceiptStatus}>
                        <input type="hidden" name="id" value={receipt.id} />
                        <input type="hidden" name="status" value="ISSUED" />
                        <Button type="submit" variant="outline">
                            {t("markIssued")}
                        </Button>
                    </form>
                )}

                {receipt.status !== "CANCELLED" && (
                    <form action={updateReceiptStatus}>
                        <input type="hidden" name="id" value={receipt.id} />
                        <input type="hidden" name="status" value="CANCELLED" />
                        <Button type="submit" variant="outline">
                            {t("markCancelled")}
                        </Button>
                    </form>
                )}

                <form action={deleteReceipt}>
                    <input type="hidden" name="id" value={receipt.id} />
                    <Button type="submit" variant="destructive" size="icon">
                        <Trash2 className="size-4" />
                        <span className="sr-only">{t("deleteReceipt")}</span>
                    </Button>
                </form>
            </div>

            <article className="print-receipt rounded-lg border bg-card p-8 print:border-0 print:p-0">
                <header className="flex items-start justify-between">
                    <div>
                        <h1 className="text-lg font-semibold">{settings.shopName}</h1>
                        <p className="text-sm text-muted-foreground">
                            {t("title")} · {t("number")} {receipt.number}
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-1 text-sm text-muted-foreground">
                        <span>{date}</span>
                        <Badge variant={STATUS_BADGE_VARIANT[receipt.status]}>
                            {tStatus(receipt.status)}
                        </Badge>
                    </div>
                </header>

                <Separator className="my-6" />

                <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">{t("customer")}</p>
                        <p className="font-medium">
                            {receipt.customerId ? (
                                <Link
                                    href={`/customers?id=${receipt.customerId}`}
                                    className="hover:underline"
                                >
                                    {receipt.customerName}
                                </Link>
                            ) : (
                                (receipt.customerName ?? t("walkIn"))
                            )}
                        </p>
                    </div>

                    {receipt.bikeName && (
                        <div>
                            <p className="text-muted-foreground">{t("bike")}</p>
                            <p className="font-medium">{receipt.bikeName}</p>
                        </div>
                    )}

                    {receipt.ticket && (
                        <div>
                            <p className="text-muted-foreground">{t("ticket")}</p>
                            <p className="font-medium">
                                <Link
                                    href={`/tickets?id=${receipt.ticket.id}`}
                                    className="hover:underline"
                                >
                                    #{receipt.ticket.number}
                                </Link>
                            </p>
                        </div>
                    )}

                    {receipt.createdBy && (
                        <div>
                            <p className="text-muted-foreground">{t("createdBy")}</p>
                            <p className="font-medium">
                                {receipt.createdBy.name ?? receipt.createdBy.email}
                            </p>
                        </div>
                    )}
                </div>

                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b text-left text-muted-foreground">
                            <th className="py-2 font-medium">{t("product")}</th>
                            <th className="py-2 text-right font-medium">{t("quantity")}</th>
                            <th className="py-2 text-right font-medium">{t("unitPrice")}</th>
                            <th className="py-2 text-right font-medium">{t("discount")}</th>
                            <th className="py-2 text-right font-medium">{t("lineTotal")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {receipt.items.map((item) => {
                            const gross = item.quantity * item.unitPrice;
                            const discount = discountAmount(
                                gross,
                                item.discountType,
                                item.discountValue,
                            );

                            return (
                                <tr key={item.id} className="border-b last:border-0">
                                    <td className="py-2">{item.name}</td>
                                    <td className="py-2 text-right tabular-nums">
                                        {item.quantity}
                                    </td>
                                    <td className="py-2 text-right tabular-nums">
                                        {formatCurrency(item.unitPrice, receipt.currency, locale)}
                                    </td>
                                    <td className="py-2 text-right tabular-nums">
                                        {item.discountType && discount > 0
                                            ? `−${formatCurrency(discount, receipt.currency, locale)}`
                                            : "—"}
                                    </td>
                                    <td className="py-2 text-right tabular-nums">
                                        {formatCurrency(gross - discount, receipt.currency, locale)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                <div className="mt-6 flex justify-end">
                    <div className="w-64 text-sm">
                        <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">{t("subtotal")}</span>
                            <span className="tabular-nums">
                                {formatCurrency(receipt.subtotal, receipt.currency, locale)}
                            </span>
                        </div>

                        {hasDiscount && (
                            <div className="flex justify-between py-1 text-destructive">
                                <span>{t("discount")}</span>
                                <span className="tabular-nums">
                                    −
                                    {formatCurrency(
                                        receipt.discountTotal,
                                        receipt.currency,
                                        locale,
                                    )}
                                </span>
                            </div>
                        )}

                        <Separator className="my-1" />

                        <div className="flex justify-between py-1 font-semibold">
                            <span>{t("total")}</span>
                            <span className="tabular-nums">
                                {formatCurrency(receipt.total, receipt.currency, locale)}
                            </span>
                        </div>
                    </div>
                </div>

                {receipt.note && (
                    <p className="mt-6 border-t pt-4 text-sm text-muted-foreground">
                        {receipt.note}
                    </p>
                )}
            </article>
        </div>
    );
}
