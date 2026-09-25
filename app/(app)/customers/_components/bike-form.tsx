"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button, buttonVariants } from "@/components/ui/button";
import { saveBike } from "../_actions/save-bike";
import type { BikeFormValues } from "../_types/bike-form-values";

const inputClass =
    "rounded-md border bg-background px-3 py-2 text-sm w-full focus:ring-2 focus:ring-ring/50 outline-none";

type BikeFormProps = {
    customerId: string;
    bike?: BikeFormValues;
};

export function BikeForm({ customerId, bike }: BikeFormProps) {
    const t = useTranslations("customers");
    const tCommon = useTranslations("common");
    const cancelHref = `/customers?id=${customerId}`;

    return (
        <form action={saveBike} className="flex flex-col gap-4">
            <input type="hidden" name="customerId" value={customerId} />
            {bike && <input type="hidden" name="id" value={bike.id} />}

            <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium">{t("bikeName")}</span>
                <input
                    className={inputClass}
                    name="name"
                    defaultValue={bike?.name ?? ""}
                    required
                    placeholder={t("bikeNamePlaceholder")}
                />
            </label>

            <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5 text-sm">
                    <span className="font-medium">{t("brand")}</span>
                    <input className={inputClass} name="brand" defaultValue={bike?.brand ?? ""} />
                </label>

                <label className="flex flex-col gap-1.5 text-sm">
                    <span className="font-medium">{t("model")}</span>
                    <input className={inputClass} name="model" defaultValue={bike?.model ?? ""} />
                </label>

                <label className="flex flex-col gap-1.5 text-sm">
                    <span className="font-medium">{t("color")}</span>
                    <input className={inputClass} name="color" defaultValue={bike?.color ?? ""} />
                </label>

                <label className="flex flex-col gap-1.5 text-sm">
                    <span className="font-medium">{t("serial")}</span>
                    <input className={inputClass} name="serial" defaultValue={bike?.serial ?? ""} />
                </label>
            </div>

            <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium">{t("note")}</span>
                <textarea
                    className={inputClass}
                    name="note"
                    rows={3}
                    defaultValue={bike?.note ?? ""}
                />
            </label>

            <div className="flex items-center justify-end gap-2">
                <Link href={cancelHref} className={buttonVariants({ variant: "ghost" })}>
                    {tCommon("cancel")}
                </Link>
                <Button type="submit">{tCommon("save")}</Button>
            </div>
        </form>
    );
}
