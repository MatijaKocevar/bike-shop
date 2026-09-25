import { db } from "@/lib/db";
import type { ShopSettings } from "@/queries/settings.types";

export const SETTINGS_KEYS: (keyof ShopSettings)[] = [
    "shopName",
    "address",
    "phone",
    "email",
    "taxId",
    "iban",
    "receiptFooter",
];

export async function getShopSettings(): Promise<ShopSettings> {
    const rows = await db.setting.findMany();
    const values = new Map(rows.map((row) => [row.key, row.value]));

    return {
        shopName: values.get("shopName") ?? "Bike Shop",
        address: values.get("address") ?? "",
        phone: values.get("phone") ?? "",
        email: values.get("email") ?? "",
        taxId: values.get("taxId") ?? "",
        iban: values.get("iban") ?? "",
        receiptFooter: values.get("receiptFooter") ?? "",
    };
}
