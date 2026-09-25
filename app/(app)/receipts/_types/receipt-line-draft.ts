export type ReceiptLineDraft = {
    key: string;
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    discountType: "" | "PERCENT" | "AMOUNT";
    discountValue: number;
};
