export type TicketLineDraft = {
    key: string;
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    done: boolean;
};

export type TicketBikeTab = {
    key: string;
    bikeId: string | null;
    bikeName: string;
    newBike: {
        name: string;
        brand: string;
        model: string;
        color: string;
        serial: string;
    };
    intakeNote: string;
    lines: TicketLineDraft[];
};
