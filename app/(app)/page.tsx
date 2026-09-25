import Link from "next/link";
import { CalendarDays, ClipboardList, Package, Receipt, Users, Wallet } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/money";
import { formatTime, todayKey } from "@/lib/dates";
import { listReceipts } from "@/queries/receipts";
import { listTodayReservations } from "@/queries/reservations";
import { getShopStats } from "@/queries/stats";
import { listTickets } from "@/queries/tickets";
import { StatCards } from "./_components/stat-cards";

const RECEIPT_STATUS_BADGE_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
    ISSUED: "secondary",
    PAID: "default",
    CANCELLED: "destructive",
};

const TICKET_STATUS_BADGE_VARIANT: Record<string, "default" | "secondary" | "outline" | "ghost"> = {
    NOVO: "default",
    V_DELU: "outline",
    KONCANO: "secondary",
    PREVZETO: "ghost",
};

export default async function DashboardPage() {
    const [stats, receipts, tickets, todayReservations] = await Promise.all([
        getShopStats(),
        listReceipts(),
        listTickets(5),
        listTodayReservations(),
    ]);
    const t = await getTranslations("dashboard");
    const tReceipts = await getTranslations("receipts");
    const tTickets = await getTranslations("tickets");
    const tCalendar = await getTranslations("calendar");
    const tReceiptStatus = await getTranslations("receiptStatus");
    const tTicketStatus = await getTranslations("ticketStatus");
    const locale = await getLocale();

    const cards = [
        {
            label: t("openTickets"),
            value: stats.openTickets,
            icon: ClipboardList,
            accent: "text-orange-600",
        },
        { label: t("products"), value: stats.products, icon: Package, accent: "text-emerald-600" },
        { label: t("receipts"), value: stats.receipts, icon: Receipt, accent: "text-violet-600" },
        { label: t("users"), value: stats.users, icon: Users, accent: "text-rose-600" },
        {
            label: t("monthReceipts"),
            value: stats.monthCount,
            icon: CalendarDays,
            accent: "text-sky-600",
        },
        {
            label: t("monthTotal"),
            value: formatCurrency(stats.monthTotal, "EUR", locale),
            icon: Wallet,
            accent: "text-amber-600",
        },
    ];

    const recentReceipts = receipts.slice(0, 5);

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
            <StatCards cards={cards} />

            <div className="grid gap-4 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0">
                        <CardTitle>{t("recentTickets")}</CardTitle>
                        <Link
                            href="/tickets?new=1"
                            className={buttonVariants({ size: "sm", variant: "outline" })}
                        >
                            {tTickets("new")}
                        </Link>
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
                                            className="flex items-center justify-between gap-3 py-2.5 text-sm"
                                        >
                                            <span className="flex min-w-0 items-center gap-2">
                                                <span className="font-medium tabular-nums">
                                                    #{ticket.number}
                                                </span>
                                                <span className="truncate text-muted-foreground">
                                                    {ticket.customerName ?? "—"}
                                                    {ticket.bikeName ? ` · ${ticket.bikeName}` : ""}
                                                </span>
                                            </span>

                                            <Badge
                                                variant={TICKET_STATUS_BADGE_VARIANT[ticket.status]}
                                            >
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
                    <CardHeader className="flex-row items-center justify-between space-y-0">
                        <CardTitle>{t("recentReceipts")}</CardTitle>
                        <Link
                            href="/receipts?new=1"
                            className={buttonVariants({ size: "sm", variant: "outline" })}
                        >
                            {t("newReceipt")}
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {recentReceipts.length === 0 ? (
                            <p className="text-sm text-muted-foreground">{t("noReceipts")}</p>
                        ) : (
                            <ul className="divide-y">
                                {recentReceipts.map((receipt) => (
                                    <li key={receipt.id}>
                                        <Link
                                            href={`/receipts?id=${receipt.id}`}
                                            className="flex items-center justify-between gap-3 py-2.5 text-sm"
                                        >
                                            <span className="flex min-w-0 items-center gap-2">
                                                <span className="font-medium tabular-nums">
                                                    #{receipt.number}
                                                </span>
                                                <span className="truncate text-muted-foreground">
                                                    {receipt.customerName ?? tReceipts("walkIn")}
                                                </span>
                                            </span>

                                            <span className="flex shrink-0 items-center gap-3">
                                                <Badge
                                                    variant={
                                                        RECEIPT_STATUS_BADGE_VARIANT[receipt.status]
                                                    }
                                                >
                                                    {tReceiptStatus(receipt.status)}
                                                </Badge>
                                                <span className="tabular-nums">
                                                    {formatCurrency(
                                                        receipt.total,
                                                        receipt.currency,
                                                        locale,
                                                    )}
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
                    <CardHeader className="flex-row items-center justify-between space-y-0">
                        <CardTitle>{t("todayReservations")}</CardTitle>
                        <Link
                            href={`/calendar?new=1&date=${todayKey()}`}
                            className={buttonVariants({ size: "sm", variant: "outline" })}
                        >
                            {tCalendar("new")}
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {todayReservations.length === 0 ? (
                            <p className="text-sm text-muted-foreground">{t("noReservations")}</p>
                        ) : (
                            <ul className="divide-y">
                                {todayReservations.map((item) => (
                                    <li key={item.id}>
                                        <Link
                                            href={`/calendar?month=${todayKey().slice(0, 7)}&id=${item.id}`}
                                            className="flex items-center justify-between gap-3 py-2.5 text-sm"
                                        >
                                            <span className="flex min-w-0 items-center gap-2">
                                                <span className="font-medium tabular-nums">
                                                    {formatTime(item.startMinutes)}
                                                </span>
                                                <span className="truncate text-muted-foreground">
                                                    {item.customerName ?? tCalendar("walkIn")}
                                                    {item.bikeName ? ` · ${item.bikeName}` : ""}
                                                </span>
                                            </span>

                                            {item.ticketNumber !== null && (
                                                <span className="shrink-0 text-xs text-muted-foreground">
                                                    #{item.ticketNumber}
                                                </span>
                                            )}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end">
                <Link href="/receipts" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                    {t("viewAll")}
                </Link>
            </div>
        </div>
    );
}
