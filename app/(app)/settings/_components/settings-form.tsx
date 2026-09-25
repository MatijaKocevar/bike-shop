import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ShopSettings } from "@/queries/settings.types";
import { saveSettings } from "../_actions/save-settings";

const inputClass =
    "rounded-md border bg-background px-3 py-2 text-sm w-full focus:ring-2 focus:ring-ring/50 outline-none";

type SettingsFormProps = {
    settings: ShopSettings;
};

export async function SettingsForm({ settings }: SettingsFormProps) {
    const t = await getTranslations("settings");
    const tCommon = await getTranslations("common");

    return (
        <form action={saveSettings} className="flex flex-col gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>{t("shopSection")}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
                        <span className="font-medium">{t("shopName")}</span>
                        <input
                            className={inputClass}
                            name="shopName"
                            defaultValue={settings.shopName}
                        />
                    </label>

                    <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
                        <span className="font-medium">{t("address")}</span>
                        <textarea
                            className={inputClass}
                            name="address"
                            rows={2}
                            defaultValue={settings.address}
                        />
                    </label>

                    <label className="flex flex-col gap-1.5 text-sm">
                        <span className="font-medium">{t("phone")}</span>
                        <input className={inputClass} name="phone" defaultValue={settings.phone} />
                    </label>

                    <label className="flex flex-col gap-1.5 text-sm">
                        <span className="font-medium">{t("email")}</span>
                        <input
                            className={inputClass}
                            name="email"
                            type="email"
                            defaultValue={settings.email}
                        />
                    </label>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t("receiptSection")}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-1.5 text-sm">
                        <span className="font-medium">{t("taxId")}</span>
                        <input className={inputClass} name="taxId" defaultValue={settings.taxId} />
                    </label>

                    <label className="flex flex-col gap-1.5 text-sm">
                        <span className="font-medium">{t("iban")}</span>
                        <input className={inputClass} name="iban" defaultValue={settings.iban} />
                    </label>

                    <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
                        <span className="font-medium">{t("receiptFooter")}</span>
                        <textarea
                            className={inputClass}
                            name="receiptFooter"
                            rows={3}
                            defaultValue={settings.receiptFooter}
                        />
                    </label>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button type="submit">{tCommon("save")}</Button>
            </div>
        </form>
    );
}
