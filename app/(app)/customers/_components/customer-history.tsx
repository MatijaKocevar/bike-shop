import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTime, parseDateKey } from "@/lib/dates";
import { formatCurrency } from "@/lib/money";
import type {
    CustomerReceiptSummary,
    CustomerReservationSummary,
    CustomerTicketSummary,
} from "@/queries/customers.types";

type CustomerHistoryProps = {
    tickets: CustomerTicketSummary[];
    receipts: CustomerReceiptSummary[];
    reservations: CustomerReservationSummary[];
};

export async function CustomerHistory({ tickets, receipts, reservations }: CustomerHistoryProps) {
    const t = await getTranslations("customers");
    const tTicketStatus = await getTranslations("ticketStatus");
    const tReceiptStatus = await getTranslations("receiptStatus");
    const locale = await getLocale();

    return (
        <div className="grid gap-4 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>{t("tickets")}</CardTitle>
                </CardHeader>
                <CardContent>
                    {tickets.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{t("noTickets")}</p>
                    ) : (
                        <ul className="divide-y">
                            {tickets.map((ticket) => (
                                <li key={ticket.id}>
                                    <Link
                                        href={`/tickets?id=${ticket.id}`}
                                        className="flex items-center justify-between gap-2 py-2.5 text-sm"
                                    >
                                        <span className="flex min-w-0 items-center gap-2">
                                            <span className="font-medium tabular-nums">
                                                #{ticket.number}
                                            </span>
                                            <span className="text-muted-foreground">
                                                {ticket.createdAt.toLocaleDateString(locale)}
                                            </span>
                                        </span>
                                        <Badge variant="outline">
                                            {tTicketStatus(ticket.status)}
                                        </Badge>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t("receipts")}</CardTitle>
                </CardHeader>
                <CardContent>
                    {receipts.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{t("noReceipts")}</p>
                    ) : (
                        <ul className="divide-y">
                            {receipts.map((receipt) => (
                                <li key={receipt.id}>
                                    <Link
                                        href={`/receipts?id=${receipt.id}`}
                                        className="flex items-center justify-between gap-2 py-2.5 text-sm"
                                    >
                                        <span className="flex min-w-0 items-center gap-2">
                                            <span className="font-medium tabular-nums">
                                                #{receipt.number}
                                            </span>
                                            <span className="text-muted-foreground">
                                                {receipt.createdAt.toLocaleDateString(locale)}
                                            </span>
                                        </span>
                                        <span className="flex shrink-0 items-center gap-3">
                                            <Badge variant="outline">
                                                {tReceiptStatus(receipt.status)}
                                            </Badge>
                                            <span className="tabular-nums">
                                                {formatCurrency(receipt.total, "EUR", locale)}
                                            </span>
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t("reservations")}</CardTitle>
                </CardHeader>
                <CardContent>
                    {reservations.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{t("noReservations")}</p>
                    ) : (
                        <ul className="divide-y">
                            {reservations.map((reservation) => {
                                const { year, month, day } = parseDateKey(reservation.date);
                                const dateLabel = new Date(year, month - 1, day).toLocaleDateString(
                                    locale,
                                );

                                return (
                                    <li key={reservation.id}>
                                        <Link
                                            href={`/calendar?month=${reservation.date.slice(0, 7)}&id=${reservation.id}`}
                                            className="flex items-center justify-between gap-2 py-2.5 text-sm"
                                        >
                                            <span className="flex min-w-0 items-center gap-2">
                                                <span className="font-medium tabular-nums">
                                                    {formatTime(reservation.startMinutes)}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    {dateLabel}
                                                </span>
                                            </span>

                                            {reservation.note && (
                                                <span className="truncate text-xs text-muted-foreground">
                                                    {reservation.note}
                                                </span>
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
