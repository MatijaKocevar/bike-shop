import type { TicketDetailItem } from "@/queries/tickets.types";

export type ReservationListItem = {
    id: string;
    date: string;
    startMinutes: number;
    durationMinutes: number;
    customerName: string | null;
    bikeName: string | null;
    note: string | null;
    ticketNumber: number | null;
};

export type ReservationTicket = {
    id: string;
    number: number;
    intakeNote: string | null;
    items: TicketDetailItem[];
};

export type ReservationDetail = {
    id: string;
    date: string;
    startMinutes: number;
    durationMinutes: number;
    note: string | null;
    customerId: string | null;
    customerName: string | null;
    customerPhone: string | null;
    bikeId: string | null;
    bikeName: string | null;
    ticketId: string | null;
    ticketNumber: number | null;
    ticket: ReservationTicket | null;
};
