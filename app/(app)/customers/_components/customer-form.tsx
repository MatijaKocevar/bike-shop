"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button, buttonVariants } from "@/components/ui/button";
import { saveCustomer } from "../_actions/save-customer";
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

    return (
        <form action={saveCustomer} className="flex flex-col gap-4">
            {customer && <input type="hidden" name="id" value={customer.id} />}
            <input type="hidden" name="returnTo" value={returnTo} />

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

            <div className="flex items-center justify-end gap-2">
                <Link href={returnTo} className={buttonVariants({ variant: "ghost" })}>
                    {tCommon("cancel")}
                </Link>
                <Button type="submit">{tCommon("save")}</Button>
            </div>
        </form>
    );
}
