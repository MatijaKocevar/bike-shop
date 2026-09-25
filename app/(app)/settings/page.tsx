import { getShopSettings } from "@/queries/settings";
import { SettingsForm } from "./_components/settings-form";

export default async function SettingsPage() {
    const settings = await getShopSettings();

    return <SettingsForm settings={settings} />;
}
