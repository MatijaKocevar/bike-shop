"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button, buttonVariants } from "@/components/ui/button";
import { SearchSelect } from "@/components/search-select";
import { discountAmount, formatCurrency, receiptTotals } from "@/lib/money";
import type { BikeOption } from "@/queries/bikes.types";
import type { CustomerOption } from "@/queries/customers.types";
import type { ProductOption } from "@/queries/products.types";
import { createReceipt } from "../_actions/create-receipt";
import type { ReceiptLineDraft } from "../_types/receipt-line-draft";

const inputClass =
    "rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring/50 outline-none";

const NEW_CUSTOMER = "__new__";

type ReceiptFormProps = {
    customers: CustomerOption[];
    bikes: BikeOption[];
    products: ProductOption[];
};

function createLine(products: ProductOption[]): ReceiptLineDraft {
    const first = products[0];

    return {
        key: crypto.randomUUID(),
        productId: first?.id ?? "",
        name: first?.name ?? "",
        quantity: 1,
        unitPrice: first?.price ?? 0,
        discountType: "",
        discountValue: 0,
    };
}

export function ReceiptForm({ customers, bikes, products }: ReceiptFormProps) {
    const t = useTranslations("receipts");
    const tCustomer = useTranslations("customers");
    const tCommon = useTranslations("common");
    const locale = useLocale();
    const [customerId, setCustomerId] = useState("");
    const [bikeId, setBikeId] = useState("");
    const [lines, setLines] = useState<ReceiptLineDraft[]>(() => [createLine(products)]);
    const [discountType, setDiscountType] = useState<"" | "PERCENT" | "AMOUNT">("");
    const [discountValue, setDiscountValue] = useState(0);

    const isNewCustomer = customerId === NEW_CUSTOMER;
    const customerBikes = bikes.filter((bike) => bike.customerId === customerId);

    function selectCustomer(id: string) {
        setCustomerId(id);
        setBikeId("");
    }

    function selectProduct(key: string, productId: string) {
        const product = products.find((option) => option.id === productId);

        setLines((current) =>
            current.map((line) =>
                line.key === key
                    ? {
                          ...line,
                          productId,
                          name: product?.name ?? "",
                          unitPrice: product?.price ?? line.unitPrice,
                      }
                    : line,
            ),
        );
    }

    function updateLine(key: string, patch: Partial<ReceiptLineDraft>) {
        setLines((current) =>
            current.map((line) => (line.key === key ? { ...line, ...patch } : line)),
        );
    }

    function addLine() {
        setLines((current) => [...current, createLine(products)]);
    }

    function removeLine(key: string) {
        setLines((current) => current.filter((line) => line.key !== key));
    }

    const totals = receiptTotals({
        items: lines.map((line) => ({
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            discountType: line.discountType === "" ? null : line.discountType,
            discountValue: line.discountValue,
        })),
        discountType: discountType === "" ? null : discountType,
        discountValue,
    });
    const valid = lines.length > 0 && lines.every((line) => line.name && line.quantity > 0);

    return (
        <form action={createReceipt} className="flex flex-col gap-4">
            <input type="hidden" name="items" value={JSON.stringify(lines)} />

            <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5 text-sm">
                    <span className="font-medium">{t("customer")}</span>
                    <SearchSelect
                        name="customerId"
                        value={customerId}
                        onChange={selectCustomer}
                        placeholder={t("walkIn")}
                        options={[
                            { value: "", label: t("walkIn") },
                            ...customers.map((customer) => ({
                                value: customer.id,
                                label: customer.name,
                                hint: customer.phone ?? undefined,
                            })),
                            { value: NEW_CUSTOMER, label: tCustomer("new") },
                        ]}
                    />
                </label>

                {!isNewCustomer && customerBikes.length > 0 && (
                    <label className="flex flex-col gap-1.5 text-sm">
                        <span className="font-medium">{t("bike")}</span>
                        <select
                            className={`${inputClass} w-full`}
                            name="bikeId"
                            value={bikeId}
                            onChange={(event) => setBikeId(event.target.value)}
                        >
                            <option value="">{tCommon("none")}</option>
                            {customerBikes.map((bike) => (
                                <option key={bike.id} value={bike.id}>
                                    {bike.name}
                                </option>
                            ))}
                        </select>
                    </label>
                )}

                <label className="flex flex-col gap-1.5 text-sm">
                    <span className="font-medium">{t("note")}</span>
                    <input
                        className={`${inputClass} w-full`}
                        name="note"
                        placeholder={t("notePlaceholder")}
                    />
                </label>
            </div>

            {isNewCustomer && (
                <div className="grid grid-cols-2 gap-4 rounded-md border border-dashed p-3">
                    <label className="flex flex-col gap-1.5 text-sm">
                        <span className="font-medium">{tCustomer("name")}</span>
                        <input className={`${inputClass} w-full`} name="newCustomerName" required />
                    </label>
                    <label className="flex flex-col gap-1.5 text-sm">
                        <span className="font-medium">{tCustomer("phone")}</span>
                        <input className={`${inputClass} w-full`} name="newCustomerPhone" />
                    </label>
                </div>
            )}

            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
                    <span className="min-w-0 flex-1">{t("product")}</span>
                    <span className="w-14 shrink-0 text-center">{t("quantity")}</span>
                    <span className="w-22 shrink-0 text-center">{t("unitPrice")}</span>
                    <span className="w-20 shrink-0 text-center">{t("discount")}</span>
                    <span className="w-20 shrink-0 text-center" />
                    <span className="w-24 shrink-0 text-right">{t("lineTotal")}</span>
                    <span className="w-8 shrink-0" />
                </div>

                {lines.map((line) => (
                    <div key={line.key} className="flex items-center gap-2">
                        <select
                            className={`${inputClass} min-w-0 flex-1`}
                            value={line.productId}
                            onChange={(event) => selectProduct(line.key, event.target.value)}
                        >
                            <option value="">{t("customItem")}</option>
                            {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.name}
                                </option>
                            ))}
                        </select>

                        {line.productId === "" && (
                            <input
                                className={`${inputClass} min-w-0 flex-1`}
                                value={line.name}
                                placeholder={t("customItemPlaceholder")}
                                onChange={(event) =>
                                    updateLine(line.key, { name: event.target.value })
                                }
                            />
                        )}

                        <input
                            className={`${inputClass} w-14 shrink-0`}
                            type="number"
                            min="1"
                            value={line.quantity}
                            onChange={(event) =>
                                updateLine(line.key, { quantity: Number(event.target.value) })
                            }
                        />

                        <input
                            className={`${inputClass} w-22 shrink-0`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.unitPrice}
                            onChange={(event) =>
                                updateLine(line.key, { unitPrice: Number(event.target.value) })
                            }
                        />

                        <select
                            className={`${inputClass} w-20 shrink-0`}
                            value={line.discountType}
                            onChange={(event) =>
                                updateLine(line.key, {
                                    discountType: event.target
                                        .value as ReceiptLineDraft["discountType"],
                                })
                            }
                        >
                            <option value="">{t("noDiscount")}</option>
                            <option value="PERCENT">%</option>
                            <option value="AMOUNT">€</option>
                        </select>

                        <input
                            className={`${inputClass} w-20 shrink-0`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.discountValue}
                            onChange={(event) =>
                                updateLine(line.key, {
                                    discountValue: Number(event.target.value),
                                })
                            }
                        />

                        <span className="w-24 shrink-0 text-right text-sm tabular-nums">
                            {formatCurrency(
                                line.quantity * line.unitPrice -
                                    discountAmount(
                                        line.quantity * line.unitPrice,
                                        line.discountType === "" ? null : line.discountType,
                                        line.discountValue,
                                    ),
                                "EUR",
                                locale,
                            )}
                        </span>

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLine(line.key)}
                            disabled={lines.length === 1}
                            aria-label={t("removeItem")}
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                ))}

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addLine}
                    className="self-start"
                >
                    <Plus className="size-4" />
                    {t("addItem")}
                </Button>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-4 border-t pt-4">
                <div className="flex items-end gap-2">
                    <label className="flex flex-col gap-1.5 text-sm">
                        <span className="font-medium">{t("discount")}</span>
                        <select
                            className={`${inputClass} w-36`}
                            name="discountType"
                            value={discountType}
                            onChange={(event) =>
                                setDiscountType(event.target.value as "" | "PERCENT" | "AMOUNT")
                            }
                        >
                            <option value="">{t("noDiscount")}</option>
                            <option value="PERCENT">{t("percent")}</option>
                            <option value="AMOUNT">{t("amount")}</option>
                        </select>
                    </label>

                    <input
                        className={`${inputClass} w-24`}
                        name="discountValue"
                        type="number"
                        min="0"
                        step="0.01"
                        value={discountValue}
                        onChange={(event) => setDiscountValue(Number(event.target.value))}
                    />
                </div>

                <div className="w-56 text-sm">
                    <div className="flex justify-between py-0.5">
                        <span className="text-muted-foreground">{t("subtotal")}</span>
                        <span className="tabular-nums">
                            {formatCurrency(totals.subtotal, "EUR", locale)}
                        </span>
                    </div>

                    {totals.discountTotal > 0 && (
                        <div className="flex justify-between py-0.5 text-destructive">
                            <span>{t("discount")}</span>
                            <span className="tabular-nums">
                                −{formatCurrency(totals.discountTotal, "EUR", locale)}
                            </span>
                        </div>
                    )}

                    <div className="flex justify-between border-t py-1 font-semibold">
                        <span>{t("total")}</span>
                        <span className="tabular-nums">
                            {formatCurrency(totals.total, "EUR", locale)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end gap-2">
                <Link href="/receipts" className={buttonVariants({ variant: "ghost" })}>
                    {tCommon("cancel")}
                </Link>
                <Button type="submit" disabled={!valid}>
                    {t("createReceipt")}
                </Button>
            </div>
        </form>
    );
}
