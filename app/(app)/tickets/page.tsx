import Link from "next/link";
import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { FormDialog } from "@/components/form-dialog";
import { TicketForm } from "@/components/ticket-form";
import { buttonVariants } from "@/components/ui/button";
import { listBikeOptions } from "@/queries/bikes";
import { listCustomerOptions } from "@/queries/customers";
import { listActiveProductOptions } from "@/queries/products";
import { getTicketById, listTickets } from "@/queries/tickets";
import { createTicket } from "./_actions/create-ticket";
import { updateTicket } from "./_actions/update-ticket";
import { TicketStatusActions } from "./_components/ticket-status-actions";
import { TicketsTable } from "./_components/tickets-table";

type TicketsPageProps = {
    searchParams: Promise<{ id?: string; new?: string }>;
};

export default async function TicketsPage({ searchParams }: TicketsPageProps) {
    const { id, new: isNew } = await searchParams;
    const [tickets, customers, bikes, products, editing] = await Promise.all([
        listTickets(),
        listCustomerOptions(),
        listBikeOptions(),
        listActiveProductOptions(),
        id ? getTicketById(id) : null,
    ]);
    const t = await getTranslations("tickets");

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <TicketsTable
                tickets={tickets}
                toolbarActions={
                    <Link
                        href="/tickets?new=1"
                        aria-label={t("new")}
                        className={buttonVariants({ size: "sm" })}
                    >
                        <Plus className="size-4" />
                        <span className="hidden sm:inline">{t("new")}</span>
                    </Link>
                }
            />

            <FormDialog
                open={Boolean(isNew)}
                onCloseHref="/tickets"
                title={t("newTitle")}
                className="overflow-y-hidden sm:h-[90dvh] sm:max-w-5xl"
            >
                {isNew ? (
                    <TicketForm
                        customers={customers}
                        bikes={bikes}
                        products={products}
                        cancelHref="/tickets"
                        createAction={createTicket}
                        updateAction={updateTicket}
                    />
                ) : null}
            </FormDialog>

            <FormDialog
                open={Boolean(editing)}
                onCloseHref="/tickets"
                title={
                    editing
                        ? `#${editing.number}${editing.customerName ? ` · ${editing.customerName}` : ""}`
                        : undefined
                }
                className="overflow-y-hidden sm:h-[90dvh] sm:max-w-5xl"
            >
                {editing ? (
                    <TicketForm
                        customers={customers}
                        bikes={bikes}
                        products={products}
                        cancelHref="/tickets"
                        createAction={createTicket}
                        updateAction={updateTicket}
                        ticket={editing}
                        actions={<TicketStatusActions ticket={editing} />}
                    />
                ) : null}
            </FormDialog>
        </div>
    );
}
