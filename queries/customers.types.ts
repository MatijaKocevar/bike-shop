import type { ReceiptStatus, TicketStatus } from "@/generated/prisma/enums";

export type CustomerListItem = {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    bikesCount: number;
    ticketsCount: number;
    receiptsCount: number;
    createdAt: Date;
};

export type CustomerOption = {
    id: string;
    name: string;
    phone: string | null;
};

export type CustomerBike = {
    id: string;
    name: string;
    brand: string | null;
    model: string | null;
    color: string | null;
    serial: string | null;
    note: string | null;
};

export type CustomerTicketSummary = {
    id: string;
    number: number;
    status: TicketStatus;
    itemsCount: number;
    createdAt: Date;
};

export type CustomerReceiptSummary = {
    id: string;
    number: number;
    status: ReceiptStatus;
    total: number;
    createdAt: Date;
};

export type CustomerReservationSummary = {
    id: string;
    date: string;
    startMinutes: number;
    durationMinutes: number;
    note: string | null;
};

export type CustomerDetail = {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    note: string | null;
    bikes: CustomerBike[];
    tickets: CustomerTicketSummary[];
    receipts: CustomerReceiptSummary[];
    reservations: CustomerReservationSummary[];
};
