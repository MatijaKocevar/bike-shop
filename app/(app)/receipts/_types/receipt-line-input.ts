export type ReceiptLineInput = {
    productId?: string | null;
    name?: string;
    quantity?: number;
    unitPrice?: number;
    discountType?: string | null;
    discountValue?: number;
};
