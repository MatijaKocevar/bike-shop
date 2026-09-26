"use client";

import { BellRing } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePushNotifications } from "../_hooks/use-push-notifications";

export function NotificationsForm() {
    const t = useTranslations("settings");
    const { status, pending, enable, disable } = usePushNotifications();

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("notificationsSection")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">{t("notificationsHint")}</p>

                {status === "unsupported" && (
                    <p className="text-sm text-muted-foreground">{t("notificationsUnsupported")}</p>
                )}

                {status === "denied" && (
                    <p className="text-sm text-destructive">{t("notificationsDenied")}</p>
                )}

                {status === "off" && (
                    <div>
                        <Button type="button" onClick={enable} disabled={pending}>
                            <BellRing className="size-4" />
                            {t("notificationsEnable")}
                        </Button>
                    </div>
                )}

                {status === "on" && (
                    <div className="flex flex-col gap-2">
                        <p className="text-sm">{t("notificationsEnabled")}</p>

                        <div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={disable}
                                disabled={pending}
                            >
                                {t("notificationsDisable")}
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
