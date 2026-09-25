"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { TicketBikeTab } from "@/components/ticket-form.types";

type TicketOverviewProps = {
    tabs: TicketBikeTab[];
    onSelectTab: (key: string) => void;
};

function tabTotal(tab: TicketBikeTab) {
    return tab.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
}

export function TicketOverview({ tabs, onSelectTab }: TicketOverviewProps) {
    const t = useTranslations("tickets");
    const tCommon = useTranslations("common");
    const locale = useLocale();
    const visible = tabs.filter(
        (tab) =>
            tab.bikeId || tab.newBike.name.trim() || tab.intakeNote.trim() || tab.lines.length > 0,
    );
    const grandTotal = visible.reduce((sum, tab) => sum + tabTotal(tab), 0);

    if (visible.length === 0) {
        return <p className="text-sm text-muted-foreground">{t("overviewEmpty")}</p>;
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
            {visible.map((tab) => {
                const label = tab.bikeId ? tab.bikeName : tab.newBike.name.trim() || t("newBike");

                return (
                    <div key={tab.key} className="shrink-0 rounded-md border p-3">
                        <button
                            type="button"
                            onClick={() => onSelectTab(tab.key)}
                            className="text-sm font-medium hover:underline"
                        >
                            {label}
                        </button>

                        {tab.intakeNote.trim() && (
                            <p className="mt-1 text-sm whitespace-pre-wrap text-muted-foreground">
                                {tab.intakeNote}
                            </p>
                        )}

                        {tab.lines.length > 0 ? (
                            <ul className="mt-2 divide-y text-sm">
                                {tab.lines.map((line) => (
                                    <li
                                        key={line.key}
                                        className="flex items-center justify-between gap-3 py-1.5"
                                    >
                                        <span
                                            className={cn(
                                                "min-w-0 truncate",
                                                line.done && "text-muted-foreground line-through",
                                            )}
                                        >
                                            {line.name}
                                        </span>
                                        <span className="shrink-0 text-muted-foreground tabular-nums">
                                            {line.quantity} ×{" "}
                                            {formatCurrency(line.unitPrice, "EUR", locale)}
                                        </span>
                                        <span className="w-20 shrink-0 text-right tabular-nums">
                                            {formatCurrency(
                                                line.quantity * line.unitPrice,
                                                "EUR",
                                                locale,
                                            )}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-2 text-sm text-muted-foreground">{t("noItems")}</p>
                        )}

                        <div className="mt-2 flex justify-between border-t pt-2 text-sm">
                            <span className="text-muted-foreground">{tCommon("total")}</span>
                            <span className="font-medium tabular-nums">
                                {formatCurrency(tabTotal(tab), "EUR", locale)}
                            </span>
                        </div>
                    </div>
                );
            })}

            <div className="flex shrink-0 justify-between border-t pt-3 text-sm font-semibold">
                <span>{tCommon("total")}</span>
                <span className="tabular-nums">{formatCurrency(grandTotal, "EUR", locale)}</span>
            </div>
        </div>
    );
}
