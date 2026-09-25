import Link from "next/link";
import { Receipt, Trash2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button, buttonVariants } from "@/components/ui/button";
import type { TicketDetail } from "@/queries/tickets.types";
import { convertTicketToReceipt } from "../_actions/convert-to-receipt";
import { deleteTicket } from "../_actions/delete-ticket";
import { setTicketStatus } from "../_actions/set-ticket-status";

type TicketStatusActionsProps = {
    ticket: TicketDetail;
};

export async function TicketStatusActions({ ticket }: TicketStatusActionsProps) {
    const t = await getTranslations("tickets");
    const closed = ticket.status === "PREVZETO";
    const startWork = setTicketStatus.bind(null, "V_DELU");
    const markDone = setTicketStatus.bind(null, "KONCANO");
    const markPickedUp = setTicketStatus.bind(null, "PREVZETO");

    return (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
            {ticket.status === "NOVO" && (
                <Button type="submit" formAction={startWork} variant="outline" size="sm">
                    {t("startWork")}
                </Button>
            )}

            {!closed && ticket.status !== "KONCANO" && (
                <Button type="submit" formAction={markDone} variant="outline" size="sm">
                    {t("markDone")}
                </Button>
            )}

            {!closed && (
                <Button type="submit" formAction={markPickedUp} variant="outline" size="sm">
                    {t("markPickedUp")}
                </Button>
            )}

            {closed && (
                <Button type="submit" formAction={markDone} variant="outline" size="sm">
                    {t("markDone")}
                </Button>
            )}

            {!ticket.receipt && (
                <Button type="submit" formAction={convertTicketToReceipt} size="sm">
                    <Receipt className="size-4" />
                    {t("convert")}
                </Button>
            )}

            {ticket.receipt && (
                <Link
                    href={`/receipts?id=${ticket.receipt.id}`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                    <Receipt className="size-4" />
                    {t("openReceipt")} #{ticket.receipt.number}
                </Link>
            )}

            <Button type="submit" formAction={deleteTicket} variant="destructive" size="icon-sm">
                <Trash2 className="size-4" />
                <span className="sr-only">{t("deleteTicket")}</span>
            </Button>
        </div>
    );
}
