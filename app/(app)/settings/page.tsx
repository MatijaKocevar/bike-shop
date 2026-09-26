import { getShopSettings } from "@/queries/settings";
import { NotificationsForm } from "./_components/notifications-form";
import { SettingsForm } from "./_components/settings-form";

export default async function SettingsPage() {
    const settings = await getShopSettings();

    return (
        <div className="flex flex-col gap-4">
            <SettingsForm settings={settings} />
            <NotificationsForm />
        </div>
    );
}
