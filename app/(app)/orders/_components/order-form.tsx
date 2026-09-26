"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { SearchSelect } from "@/components/search-select";
import { Button, buttonVariants } from "@/components/ui/button";
import type { CustomerOption } from "@/queries/customers.types";
import { saveOrder } from "../_actions/save-order";
import type { OrderFormValues } from "../_types/order-form-values";

const inputClass =
    "rounded-md border bg-background px-3 py-2 text-sm w-full focus:ring-2 focus:ring-ring/50 outline-none";

type OrderFormProps = {
    order?: OrderFormValues;
    customers: CustomerOption[];
};

export function OrderForm({ order, customers }: OrderFormProps) {
    const t = useTranslations("orders");
    const tCommon = useTranslations("common");
    const [customerId, setCustomerId] = useState(order?.customerId ?? "");

    const customerOptions = [
        { value: "", label: t("noCustomer") },
        ...customers.map((customer) => ({
            value: customer.id,
            label: customer.name,
            hint: customer.phone ?? undefined,
        })),
    ];

    return (
        <form action={saveOrder} className="flex flex-col gap-4">
            {order && <input type="hidden" name="id" value={order.id} />}

            <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium">{t("customer")}</span>
                <SearchSelect
                    name="customerId"
                    value={customerId}
                    onChange={setCustomerId}
                    options={customerOptions}
                    placeholder={t("noCustomer")}
                />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium">{t("name")}</span>
                <input
                    className={inputClass}
                    name="name"
                    defaultValue={order?.name ?? ""}
                    placeholder={t("namePlaceholder")}
                    required
                />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium">{t("expectedAt")}</span>
                <input
                    className={inputClass}
                    name="expectedAt"
                    type="date"
                    defaultValue={order?.expectedAt ?? ""}
                    required
                />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium">{t("note")}</span>
                <textarea
                    className={inputClass}
                    name="note"
                    rows={3}
                    defaultValue={order?.note ?? ""}
                    placeholder={t("notePlaceholder")}
                />
            </label>

            <div className="flex items-center justify-end gap-2">
                <Link href="/orders" className={buttonVariants({ variant: "ghost" })}>
                    {tCommon("cancel")}
                </Link>
                <Button type="submit">{order ? tCommon("save") : t("createOrder")}</Button>
            </div>
        </form>
    );
}
