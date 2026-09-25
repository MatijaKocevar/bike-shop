import type { TicketStatus } from "@/generated/prisma/enums";

export type TicketListItem = {
    id: string;
    number: number;
    status: TicketStatus;
    customerName: string | null;
    bikeName: string | null;
    itemsCount: number;
    total: number;
    createdAt: Date;
};

export type TicketDetailItem = {
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    done: boolean;
    productId: string | null;
};

export type TicketDetail = {
    id: string;
    number: number;
    status: TicketStatus;
    intakeNote: string | null;
    createdAt: Date;
    completedAt: Date | null;
    customerId: string | null;
    customerName: string | null;
    customerPhone: string | null;
    bikeId: string | null;
    bikeName: string | null;
    receipt: { id: string; number: number } | null;
    items: TicketDetailItem[];
    total: number;
};
