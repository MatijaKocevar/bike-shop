import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { FormDialog } from "@/components/form-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { listCustomerOptions } from "@/queries/customers";
import { getOrderById, listOrders } from "@/queries/orders";
import { deleteOrder } from "./_actions/delete-order";
import { OrderForm } from "./_components/order-form";
import { OrdersTable } from "./_components/orders-table";

type OrdersPageProps = {
    searchParams: Promise<{ id?: string; new?: string }>;
};

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
    const { id, new: isNew } = await searchParams;
    const [orders, customers, editing] = await Promise.all([
        listOrders(),
        listCustomerOptions(),
        id ? getOrderById(id) : null,
    ]);
    const t = await getTranslations("orders");

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <OrdersTable
                orders={orders}
                toolbarActions={
                    <Link
                        href="/orders?new=1"
                        aria-label={t("new")}
                        className={buttonVariants({ size: "sm" })}
                    >
                        <Plus className="size-4" />
                        <span className="hidden sm:inline">{t("new")}</span>
                    </Link>
                }
            />

            <FormDialog
                open={Boolean(isNew) || Boolean(editing)}
                onCloseHref="/orders"
                title={editing ? t("edit") : t("newTitle")}
                className="sm:max-w-xl"
            >
                {editing ? (
                    <div className="flex flex-col gap-6">
                        <OrderForm
                            order={{
                                id: editing.id,
                                name: editing.name,
                                expectedAt: editing.expectedAt,
                                note: editing.note,
                                customerId: editing.customerId,
                            }}
                            customers={customers}
                        />

                        <div>
                            <Separator className="mb-6" />

                            <form action={deleteOrder}>
                                <input type="hidden" name="id" value={editing.id} />
                                <Button type="submit" variant="destructive">
                                    <Trash2 className="size-4" />
                                    {t("deleteOrder")}
                                </Button>
                            </form>
                        </div>
                    </div>
                ) : isNew ? (
                    <OrderForm customers={customers} />
                ) : null}
            </FormDialog>
        </div>
    );
}
