export type TicketLineInput = {
    productId?: string | null;
    name?: string;
    quantity?: number;
    unitPrice?: number;
    done?: boolean;
};

export type ParsedTicketLine = {
    productId: string | null;
    name: string;
    quantity: number;
    unitPrice: number;
    done: boolean;
};
