import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { FormDialog } from "@/components/form-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCustomerById, listCustomers } from "@/queries/customers";
import { deleteCustomer } from "./_actions/delete-customer";
import { BikeForm } from "./_components/bike-form";
import { CustomerBikes } from "./_components/customer-bikes";
import { CustomerForm } from "./_components/customer-form";
import { CustomerHistory } from "./_components/customer-history";
import { CustomersTable } from "./_components/customers-table";

type CustomersPageProps = {
    searchParams: Promise<{ id?: string; new?: string; edit?: string; bike?: string }>;
};

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
    const { id, new: isNew, edit, bike } = await searchParams;
    const [customers, editing] = await Promise.all([
        listCustomers(),
        id ? getCustomerById(id) : null,
    ]);
    const t = await getTranslations("customers");

    const editingBike =
        editing && bike && bike !== "new"
            ? (editing.bikes.find((row) => row.id === bike) ?? null)
            : null;
    const creatingBike = Boolean(editing) && bike === "new";
    const showBikeForm = Boolean(editing) && (creatingBike || Boolean(editingBike));
    const showCustomerForm = Boolean(editing) && edit === "1" && !showBikeForm;

    const dialogTitle = showBikeForm
        ? editingBike
            ? t("editBike")
            : t("addBike")
        : showCustomerForm
          ? t("edit")
          : (editing?.name ?? undefined);

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <CustomersTable
                customers={customers}
                toolbarActions={
                    <Link
                        href="/customers?new=1"
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
                onCloseHref="/customers"
                title={t("newTitle")}
                className="sm:max-w-xl"
            >
                {isNew ? <CustomerForm /> : null}
            </FormDialog>

            <FormDialog
                open={Boolean(editing)}
                onCloseHref="/customers"
                title={dialogTitle}
                className="overflow-y-auto sm:h-[90dvh] sm:max-w-3xl"
            >
                {editing ? (
                    showBikeForm ? (
                        <BikeForm customerId={editing.id} bike={editingBike ?? undefined} />
                    ) : showCustomerForm ? (
                        <CustomerForm
                            customer={{
                                id: editing.id,
                                name: editing.name,
                                phone: editing.phone,
                                email: editing.email,
                                note: editing.note,
                            }}
                            returnTo={`/customers?id=${editing.id}`}
                        />
                    ) : (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-end gap-2">
                                <Link
                                    href={`/customers?id=${editing.id}&edit=1`}
                                    className={buttonVariants({ variant: "outline", size: "sm" })}
                                >
                                    <Pencil className="size-4" />
                                    {t("edit")}
                                </Link>

                                <form action={deleteCustomer}>
                                    <input type="hidden" name="id" value={editing.id} />
                                    <Button type="submit" variant="destructive" size="icon-sm">
                                        <Trash2 className="size-4" />
                                        <span className="sr-only">{t("deleteCustomer")}</span>
                                    </Button>
                                </form>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>{editing.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">{t("phone")}</p>
                                        <p className="font-medium">{editing.phone ?? "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">{t("email")}</p>
                                        <p className="font-medium">{editing.email ?? "—"}</p>
                                    </div>
                                    {editing.note && (
                                        <div className="col-span-2">
                                            <p className="text-muted-foreground">{t("note")}</p>
                                            <p className="whitespace-pre-wrap">{editing.note}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <CustomerBikes customerId={editing.id} bikes={editing.bikes} />

                            <CustomerHistory
                                tickets={editing.tickets}
                                receipts={editing.receipts}
                                reservations={editing.reservations}
                            />
                        </div>
                    )
                ) : null}
            </FormDialog>
        </div>
    );
}
