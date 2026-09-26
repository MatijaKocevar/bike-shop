export type ReservationReminder = {
    id: string;
    date: string;
    startMinutes: number;
    customerName: string | null;
    bikeName: string | null;
};
