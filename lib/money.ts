import type { DiscountType } from "@/generated/prisma/enums";
import type { ReceiptTotals, ReceiptTotalsInput } from "@/lib/money.types";

export function round2(value: number): number {
    return Math.round(value * 100) / 100;
}

export function formatCurrency(value: number, currency = "EUR", locale = "en"): string {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
    }).format(value);
}

export function discountAmount(base: number, type: DiscountType | null, value: number): number {
    if (!type || value <= 0) return 0;

    const amount = type === "PERCENT" ? (base * value) / 100 : value;

    return round2(Math.min(Math.max(amount, 0), base));
}

export function receiptTotals(input: ReceiptTotalsInput): ReceiptTotals {
    const subtotal = round2(
        input.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    );
    const lineDiscounts = round2(
        input.items.reduce(
            (sum, item) =>
                sum +
                discountAmount(
                    item.quantity * item.unitPrice,
                    item.discountType,
                    item.discountValue,
                ),
            0,
        ),
    );
    const afterLines = round2(subtotal - lineDiscounts);
    const overallDiscount = discountAmount(afterLines, input.discountType, input.discountValue);
    const discountTotal = round2(lineDiscounts + overallDiscount);

    return {
        subtotal,
        lineDiscounts,
        overallDiscount,
        discountTotal,
        total: round2(subtotal - discountTotal),
    };
}
