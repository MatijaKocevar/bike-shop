import type { DiscountType, ReceiptStatus } from "@/generated/prisma/enums";

export type ReceiptListItem = {
    id: string;
    number: number;
    customerName: string | null;
    status: ReceiptStatus;
    currency: string;
    total: number;
    itemsCount: number;
    createdAt: Date;
};

export type ReceiptDetailItem = {
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    discountType: DiscountType | null;
    discountValue: number;
    productId: string | null;
};

export type ReceiptDetail = {
    id: string;
    number: number;
    customerName: string | null;
    bikeName: string | null;
    note: string | null;
    status: ReceiptStatus;
    currency: string;
    subtotal: number;
    discountType: DiscountType | null;
    discountValue: number;
    discountTotal: number;
    total: number;
    createdAt: Date;
    customerId: string | null;
    createdBy: { name: string | null; email: string | null } | null;
    ticket: { id: string; number: number } | null;
    items: ReceiptDetailItem[];
};
