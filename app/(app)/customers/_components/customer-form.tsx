"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button, buttonVariants } from "@/components/ui/button";
import { saveCustomer } from "../_actions/save-customer";
import type { CustomerBikeDraft } from "../_types/customer-bike-draft";
import type { CustomerFormValues } from "../_types/customer-form-values";

const inputClass =
    "rounded-md border bg-background px-3 py-2 text-sm w-full focus:ring-2 focus:ring-ring/50 outline-none";

type CustomerFormProps = {
    customer?: CustomerFormValues;
    returnTo?: string;
};

export function CustomerForm({ customer, returnTo = "/customers" }: CustomerFormProps) {
    const t = useTranslations("customers");
    const tCommon = useTranslations("common");
    const [bikes, setBikes] = useState<CustomerBikeDraft[]>(() =>
        customer ? [] : [{ key: crypto.randomUUID(), name: "", color: "" }],
    );

    function addBike() {
        setBikes((current) => [...current, { key: crypto.randomUUID(), name: "", color: "" }]);
    }

    function updateBike(key: string, patch: Partial<CustomerBikeDraft>) {
        setBikes((current) =>
            current.map((bike) => (bike.key === key ? { ...bike, ...patch } : bike)),
        );
    }

    function removeBike(key: string) {
        setBikes((current) => current.filter((bike) => bike.key !== key));
    }

    return (
        <form action={saveCustomer} className="flex flex-col gap-4">
            {customer && <input type="hidden" name="id" value={customer.id} />}
            <input type="hidden" name="returnTo" value={returnTo} />
            {!customer && (
                <input
                    type="hidden"
                    name="bikes"
                    value={JSON.stringify(
                        bikes.map((bike) => ({ name: bike.name, color: bike.color })),
                    )}
                />
            )}

            <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium">{t("name")}</span>
                <input
                    className={inputClass}
                    name="name"
                    defaultValue={customer?.name ?? ""}
                    required
                />
            </label>

            <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5 text-sm">
                    <span className="font-medium">{t("phone")}</span>
                    <input
                        className={inputClass}
                        name="phone"
                        defaultValue={customer?.phone ?? ""}
                    />
                </label>

                <label className="flex flex-col gap-1.5 text-sm">
                    <span className="font-medium">{t("email")}</span>
                    <input
                        className={inputClass}
                        name="email"
                        type="email"
                        defaultValue={customer?.email ?? ""}
                    />
                </label>
            </div>

            <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium">{t("note")}</span>
                <textarea
                    className={inputClass}
                    name="note"
                    rows={3}
                    defaultValue={customer?.note ?? ""}
                />
            </label>

            {!customer && (
                <div className="flex flex-col gap-3 rounded-md border border-dashed p-3">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">{t("bikes")}</span>

                        <Button type="button" variant="outline" size="sm" onClick={addBike}>
                            <Plus className="size-4" />
                            {t("addBike")}
                        </Button>
                    </div>

                    {bikes.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{t("noBikes")}</p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {bikes.map((bike) => (
                                <div key={bike.key} className="flex items-center gap-2">
                                    <input
                                        className={inputClass}
                                        value={bike.name}
                                        placeholder={t("bikeNamePlaceholder")}
                                        aria-label={t("bikeName")}
                                        onChange={(event) =>
                                            updateBike(bike.key, { name: event.target.value })
                                        }
                                    />

                                    <input
                                        className={`${inputClass} max-w-32`}
                                        value={bike.color}
                                        placeholder={t("color")}
                                        aria-label={t("color")}
                                        onChange={(event) =>
                                            updateBike(bike.key, { color: event.target.value })
                                        }
                                    />

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeBike(bike.key)}
                                        aria-label={t("deleteBike")}
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="flex items-center justify-end gap-2">
                <Link href={returnTo} className={buttonVariants({ variant: "ghost" })}>
                    {tCommon("cancel")}
                </Link>
                <Button type="submit">{tCommon("save")}</Button>
            </div>
        </form>
    );
}
