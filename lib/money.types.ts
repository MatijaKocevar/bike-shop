import type { DiscountType } from "@/generated/prisma/enums";

export type DiscountInput = {
    type: DiscountType | null;
    value: number;
};

export type ReceiptTotalsInput = {
    items: {
        quantity: number;
        unitPrice: number;
        discountType: DiscountType | null;
        discountValue: number;
    }[];
    discountType: DiscountType | null;
    discountValue: number;
};

export type ReceiptTotals = {
    subtotal: number;
    lineDiscounts: number;
    overallDiscount: number;
    discountTotal: number;
    total: number;
};
