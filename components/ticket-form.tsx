"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { TicketOverview } from "@/components/ticket-overview";
import type { TicketBikeTab, TicketLineDraft } from "@/components/ticket-form.types";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatTime, parseTime } from "@/lib/dates";
import { formatCurrency } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { BikeOption } from "@/queries/bikes.types";
import type { CustomerOption } from "@/queries/customers.types";
import type { ProductOption } from "@/queries/products.types";
import type { ReservationDetail, ReservationListItem } from "@/queries/reservations.types";
import type { TicketDetail, TicketDetailItem } from "@/queries/tickets.types";

const inputClass =
    "rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring/50 outline-none";
const OVERVIEW_KEY = "__overview__";

type TicketFormProps = {
    customers: CustomerOption[];
    bikes: BikeOption[];
    products: ProductOption[];
    cancelHref: string;
    createAction: (formData: FormData) => Promise<void>;
    updateAction: (formData: FormData) => Promise<void>;
    deleteAction?: (formData: FormData) => Promise<void>;
    ticket?: TicketDetail;
    reservation?: ReservationDetail;
    defaultDate?: string;
    reservations?: ReservationListItem[];
    actions?: React.ReactNode;
};

type TicketFormState = {
    savedAt: number;
} | null;

function createBikeTab(bike?: BikeOption): TicketBikeTab {
    return {
        key: crypto.randomUUID(),
        bikeId: bike?.id ?? null,
        bikeName: bike?.name ?? "",
        newBike: { name: "", brand: "", model: "", color: "", serial: "" },
        intakeNote: "",
        lines: [],
    };
}

function customerTabs(customerId: string, bikes: BikeOption[]): TicketBikeTab[] {
    const own = bikes.filter((bike) => bike.customerId === customerId);

    return [...own.map((bike) => createBikeTab(bike)), createBikeTab()];
}

function createLine(products: ProductOption[]): TicketLineDraft {
    const first = products[0];

    return {
        key: crypto.randomUUID(),
        productId: first?.id ?? "",
        name: first?.name ?? "",
        quantity: 1,
        unitPrice: first?.price ?? 0,
        done: false,
    };
}

function toDraft(item: TicketDetailItem): TicketLineDraft {
    return {
        key: item.id,
        productId: item.productId ?? "",
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        done: item.done,
    };
}

function ticketTab(ticket: TicketDetail): TicketBikeTab {
    return {
        key: ticket.id,
        bikeId: ticket.bikeId,
        bikeName: ticket.bikeName ?? "",
        newBike: { name: "", brand: "", model: "", color: "", serial: "" },
        intakeNote: ticket.intakeNote ?? "",
        lines: ticket.items.map(toDraft),
    };
}

function reservationTab(reservation: ReservationDetail): TicketBikeTab {
    return {
        key: reservation.ticket?.id ?? crypto.randomUUID(),
        bikeId: reservation.bikeId,
        bikeName: reservation.bikeName ?? "",
        newBike: { name: "", brand: "", model: "", color: "", serial: "" },
        intakeNote: reservation.ticket?.intakeNote ?? "",
        lines: reservation.ticket ? reservation.ticket.items.map(toDraft) : [],
    };
}

export function TicketForm({
    customers,
    bikes,
    products,
    cancelHref,
    createAction,
    updateAction,
    deleteAction,
    ticket,
    reservation,
    defaultDate,
    reservations = [],
    actions,
}: TicketFormProps) {
    const t = useTranslations("tickets");
    const tCalendar = useTranslations("calendar");
    const tCustomer = useTranslations("customers");
    const tCommon = useTranslations("common");
    const locale = useLocale();
    const isReservation = Boolean(reservation) || defaultDate !== undefined;
    const isEdit = Boolean(ticket) || Boolean(reservation);
    const [customerId, setCustomerId] = useState(
        ticket?.customerId ?? reservation?.customerId ?? customers[0]?.id ?? "",
    );
    const [creatingCustomer, setCreatingCustomer] = useState(!isEdit && customers.length === 0);
    const [tabs, setTabs] = useState<TicketBikeTab[]>(() => {
        if (ticket) return [ticketTab(ticket), createBikeTab()];
        if (reservation) return [reservationTab(reservation), createBikeTab()];

        return customers.length > 0 ? customerTabs(customers[0].id, bikes) : [createBikeTab()];
    });
    const [activeKey, setActiveKey] = useState("");
    const [date, setDate] = useState(reservation?.date ?? defaultDate ?? "");
    const [time, setTime] = useState(reservation ? formatTime(reservation.startMinutes) : "09:00");
    const [durationMinutes, setDurationMinutes] = useState(reservation?.durationMinutes ?? 60);
    const [reservationNote, setReservationNote] = useState(reservation?.note ?? "");
    const [, editAction] = useActionState(
        async (_previous: TicketFormState, formData: FormData): Promise<TicketFormState> => {
            await updateAction(formData);

            setTabs((current) => [current[0], createBikeTab()]);
            setActiveKey("");

            return _previous;
        },
        null,
    );

    const active = tabs.find((tab) => tab.key === activeKey) ?? tabs[0];
    const overviewActive = activeKey === OVERVIEW_KEY;
    const showCustomerForm = !isEdit && (creatingCustomer || customers.length === 0);
    const customerName = ticket?.customerName ?? reservation?.customerName ?? "—";
    const customerPhone = ticket?.customerPhone ?? reservation?.customerPhone ?? null;

    function selectCustomer(id: string) {
        const next = customerTabs(id, bikes);

        setCustomerId(id);
        setTabs(next);
        setActiveKey(next[0].key);
    }

    function toggleCustomerForm() {
        if (showCustomerForm) {
            setCreatingCustomer(false);
            selectCustomer(customerId || customers[0].id);

            return;
        }

        const next = [createBikeTab()];

        setCreatingCustomer(true);
        setTabs(next);
        setActiveKey(next[0].key);
    }

    function updateActiveTab(patch: Partial<TicketBikeTab>) {
        setTabs((current) =>
            current.map((tab) => (tab.key === active.key ? { ...tab, ...patch } : tab)),
        );
    }

    function selectProduct(key: string, productId: string) {
        const product = products.find((option) => option.id === productId);

        updateActiveTab({
            lines: active.lines.map((line) =>
                line.key === key
                    ? {
                          ...line,
                          productId,
                          name: product?.name ?? "",
                          unitPrice: product?.price ?? line.unitPrice,
                      }
                    : line,
            ),
        });
    }

    function updateLine(key: string, patch: Partial<TicketLineDraft>) {
        updateActiveTab({
            lines: active.lines.map((line) => (line.key === key ? { ...line, ...patch } : line)),
        });
    }

    function addLine() {
        updateActiveTab({ lines: [...active.lines, createLine(products)] });
    }

    function removeLine(key: string) {
        updateActiveTab({ lines: active.lines.filter((line) => line.key !== key) });
    }

    function renderTab(tab: TicketBikeTab) {
        const label = tab.bikeId ? tab.bikeName : tab.newBike.name.trim() || t("newBike");

        return (
            <button
                key={tab.key}
                type="button"
                onClick={() => setActiveKey(tab.key)}
                className={cn(
                    "-mb-px shrink-0 border-b-2 border-transparent px-3 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground hover:text-foreground",
                    active.key === tab.key && "border-primary text-foreground",
                )}
            >
                {label}
                {tab.lines.length > 0 ? ` (${tab.lines.length})` : ""}
            </button>
        );
    }

    const bikeTabs = tabs.filter((tab) => tab.bikeId !== null);
    const newBikeTabs = tabs.filter((tab) => tab.bikeId === null);
    const entries = tabs
        .filter((tab) => tab.bikeId || tab.newBike.name.trim())
        .map((tab) => ({
            bikeId: tab.bikeId,
            newBike: tab.bikeId
                ? null
                : {
                      name: tab.newBike.name.trim(),
                      brand: tab.newBike.brand.trim(),
                      model: tab.newBike.model.trim(),
                      color: tab.newBike.color.trim(),
                      serial: tab.newBike.serial.trim(),
                  },
            intakeNote: tab.intakeNote,
            items: tab.lines,
        }));
    const missingBikeName = tabs.some(
        (tab) =>
            !tab.bikeId &&
            !tab.newBike.name.trim() &&
            (tab.intakeNote.trim() !== "" || tab.lines.length > 0),
    );
    const total = active.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
    const grandTotal = tabs.reduce(
        (sum, tab) =>
            sum + tab.lines.reduce((tabSum, line) => tabSum + line.quantity * line.unitPrice, 0),
        0,
    );
    const startMinutes = isReservation ? parseTime(time) : null;
    const endMinutes =
        startMinutes === null ? null : startMinutes + Math.max(15, durationMinutes || 0);
    const conflict =
        isReservation && startMinutes !== null && endMinutes !== null
            ? reservations.find(
                  (item) =>
                      item.date === date &&
                      item.id !== reservation?.id &&
                      startMinutes < item.startMinutes + item.durationMinutes &&
                      item.startMinutes < endMinutes,
              )
            : undefined;
    const canSubmit = isReservation
        ? date !== "" && startMinutes !== null
        : entries.length > 0 && !missingBikeName;

    return (
        <form
            action={isEdit ? editAction : createAction}
            className="flex h-full min-h-0 flex-col gap-4"
        >
            {(ticket || reservation) && (
                <input type="hidden" name="id" value={(ticket ?? reservation)?.id ?? ""} />
            )}
            <input type="hidden" name="entries" value={JSON.stringify(entries)} />

            {isReservation && (
                <div className="flex shrink-0 flex-col gap-3">
                    <div className="grid grid-cols-3 gap-4">
                        <label className="flex flex-col gap-1.5 text-sm">
                            <span className="font-medium">{tCalendar("date")}</span>
                            <input
                                className={`${inputClass} w-full`}
                                type="date"
                                name="date"
                                value={date}
                                onChange={(event) => setDate(event.target.value)}
                                required
                            />
                        </label>

                        <label className="flex flex-col gap-1.5 text-sm">
                            <span className="font-medium">{tCalendar("time")}</span>
                            <input
                                className={`${inputClass} w-full`}
                                type="time"
                                name="time"
                                value={time}
                                onChange={(event) => setTime(event.target.value)}
                                required
                            />
                        </label>

                        <label className="flex flex-col gap-1.5 text-sm">
                            <span className="font-medium">{tCalendar("duration")}</span>
                            <input
                                className={`${inputClass} w-full`}
                                type="number"
                                name="durationMinutes"
                                min="15"
                                step="15"
                                value={durationMinutes}
                                onChange={(event) => setDurationMinutes(Number(event.target.value))}
                            />
                        </label>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            className={`${inputClass} max-w-md`}
                            name="note"
                            value={reservationNote}
                            placeholder={tCalendar("notePlaceholder")}
                            onChange={(event) => setReservationNote(event.target.value)}
                        />
                        {endMinutes !== null && (
                            <span className="text-xs text-muted-foreground">
                                {tCalendar("endsAt", { time: formatTime(endMinutes) })}
                            </span>
                        )}
                    </div>

                    {conflict && (
                        <p className="text-sm text-amber-600">
                            {tCalendar("conflict", {
                                time: formatTime(conflict.startMinutes),
                            })}
                        </p>
                    )}
                </div>
            )}

            <div className="flex shrink-0 items-end gap-2">
                <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-sm">
                    <span className="font-medium">{t("customer")}</span>
                    {isEdit ? (
                        <select
                            className={`${inputClass} w-full disabled:opacity-100 disabled:text-foreground`}
                            defaultValue={customerId}
                            disabled
                        >
                            <option value={customerId}>
                                {customerName}
                                {customerPhone ? ` · ${customerPhone}` : ""}
                            </option>
                        </select>
                    ) : showCustomerForm ? (
                        <input
                            className={`${inputClass} w-full`}
                            name="newCustomerName"
                            required
                            autoFocus
                            placeholder={t("newCustomerNamePlaceholder")}
                        />
                    ) : (
                        <select
                            className={`${inputClass} w-full`}
                            name="customerId"
                            value={customerId}
                            onChange={(event) => selectCustomer(event.target.value)}
                        >
                            {customers.map((customer) => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.name}
                                    {customer.phone ? ` · ${customer.phone}` : ""}
                                </option>
                            ))}
                        </select>
                    )}
                </label>

                {!isEdit && customers.length > 0 && (
                    <Button
                        type="button"
                        variant={showCustomerForm ? "ghost" : "outline"}
                        onClick={toggleCustomerForm}
                    >
                        {showCustomerForm ? (
                            <X className="size-4" />
                        ) : (
                            <>
                                <Plus className="size-4" />
                                {tCustomer("new")}
                            </>
                        )}
                        <span className="sr-only">
                            {showCustomerForm ? tCommon("cancel") : tCustomer("new")}
                        </span>
                    </Button>
                )}
            </div>

            {showCustomerForm && (
                <label className="flex shrink-0 flex-col gap-1.5 text-sm">
                    <span className="font-medium">{tCustomer("phone")}</span>
                    <input className={`${inputClass} w-full`} name="newCustomerPhone" />
                </label>
            )}

            {actions && <div className="shrink-0">{actions}</div>}

            <div className="flex min-h-0 flex-1 flex-col">
                <div className="flex shrink-0 items-center border-b">
                    <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto overflow-y-hidden">
                        {bikeTabs.map(renderTab)}
                    </div>

                    {bikeTabs.length > 0 && <div className="mx-2 h-4 w-px shrink-0 bg-border" />}

                    <div className="flex shrink-0 items-center gap-1">
                        {newBikeTabs.map(renderTab)}

                        <button
                            type="button"
                            onClick={() => setActiveKey(OVERVIEW_KEY)}
                            className={cn(
                                "-mb-px shrink-0 border-b-2 border-transparent px-3 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground hover:text-foreground",
                                overviewActive && "border-primary text-foreground",
                            )}
                        >
                            {t("overview")}
                        </button>
                    </div>
                </div>

                <div className="flex min-h-0 flex-1 flex-col gap-4 pt-4">
                    {overviewActive ? (
                        <TicketOverview tabs={tabs} onSelectTab={setActiveKey} />
                    ) : (
                        <>
                            {!active.bikeId && (
                                <div className="flex shrink-0 flex-col gap-3 rounded-md border border-dashed p-3">
                                    <span className="text-sm font-medium">{t("newBike")}</span>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            className={`${inputClass} w-full`}
                                            value={active.newBike.name}
                                            placeholder={t("bikeNamePlaceholder")}
                                            onChange={(event) =>
                                                updateActiveTab({
                                                    newBike: {
                                                        ...active.newBike,
                                                        name: event.target.value,
                                                    },
                                                })
                                            }
                                        />
                                        <input
                                            className={`${inputClass} w-full`}
                                            value={active.newBike.brand}
                                            placeholder={t("bikeBrandPlaceholder")}
                                            onChange={(event) =>
                                                updateActiveTab({
                                                    newBike: {
                                                        ...active.newBike,
                                                        brand: event.target.value,
                                                    },
                                                })
                                            }
                                        />
                                        <input
                                            className={`${inputClass} w-full`}
                                            value={active.newBike.model}
                                            placeholder={t("bikeModelPlaceholder")}
                                            onChange={(event) =>
                                                updateActiveTab({
                                                    newBike: {
                                                        ...active.newBike,
                                                        model: event.target.value,
                                                    },
                                                })
                                            }
                                        />
                                        <input
                                            className={`${inputClass} w-full`}
                                            value={active.newBike.color}
                                            placeholder={t("bikeColorPlaceholder")}
                                            onChange={(event) =>
                                                updateActiveTab({
                                                    newBike: {
                                                        ...active.newBike,
                                                        color: event.target.value,
                                                    },
                                                })
                                            }
                                        />
                                        <input
                                            className={`${inputClass} w-full col-span-2`}
                                            value={active.newBike.serial}
                                            placeholder={t("bikeSerialPlaceholder")}
                                            onChange={(event) =>
                                                updateActiveTab({
                                                    newBike: {
                                                        ...active.newBike,
                                                        serial: event.target.value,
                                                    },
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            )}

                            <label className="flex min-h-24 flex-1 flex-col gap-1.5 text-sm">
                                <span className="font-medium">{t("intakeNote")}</span>
                                <textarea
                                    className={`${inputClass} min-h-0 w-full flex-1 resize-none`}
                                    value={active.intakeNote}
                                    placeholder={t("intakeNotePlaceholder")}
                                    onChange={(event) =>
                                        updateActiveTab({ intakeNote: event.target.value })
                                    }
                                />
                            </label>

                            <div
                                className={cn(
                                    "flex flex-col gap-2",
                                    active.lines.length > 0 ? "min-h-0 flex-1" : "shrink-0",
                                )}
                            >
                                <span className="shrink-0 text-sm font-medium">
                                    {t("checklist")}
                                </span>

                                {active.lines.length === 0 && (
                                    <p className="text-sm text-muted-foreground">{t("noItems")}</p>
                                )}

                                {active.lines.length > 0 && (
                                    <div className="flex shrink-0 items-center gap-2 px-1 text-xs text-muted-foreground">
                                        <span className="min-w-0 flex-1">{t("service")}</span>
                                        <span className="w-16 shrink-0 text-center">
                                            {t("quantity")}
                                        </span>
                                        <span className="w-24 shrink-0 text-center">
                                            {t("unitPrice")}
                                        </span>
                                        <span className="w-14 shrink-0 text-center">
                                            {t("done")}
                                        </span>
                                        <span className="w-8 shrink-0" />
                                    </div>
                                )}

                                <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
                                    {active.lines.map((line) => (
                                        <div
                                            key={line.key}
                                            className="flex shrink-0 items-center gap-2"
                                        >
                                            <select
                                                className={`${inputClass} min-w-0 flex-1`}
                                                value={line.productId}
                                                onChange={(event) =>
                                                    selectProduct(line.key, event.target.value)
                                                }
                                            >
                                                <option value="">{t("customItem")}</option>
                                                {products.map((product) => (
                                                    <option key={product.id} value={product.id}>
                                                        {product.name}
                                                    </option>
                                                ))}
                                            </select>

                                            {line.productId === "" && (
                                                <input
                                                    className={`${inputClass} min-w-0 flex-1`}
                                                    value={line.name}
                                                    placeholder={t("customItemPlaceholder")}
                                                    onChange={(event) =>
                                                        updateLine(line.key, {
                                                            name: event.target.value,
                                                        })
                                                    }
                                                />
                                            )}

                                            <input
                                                className={`${inputClass} w-16 shrink-0`}
                                                type="number"
                                                min="1"
                                                value={line.quantity}
                                                onChange={(event) =>
                                                    updateLine(line.key, {
                                                        quantity: Number(event.target.value),
                                                    })
                                                }
                                            />

                                            <input
                                                className={`${inputClass} w-24 shrink-0`}
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={line.unitPrice}
                                                onChange={(event) =>
                                                    updateLine(line.key, {
                                                        unitPrice: Number(event.target.value),
                                                    })
                                                }
                                            />

                                            <label className="flex w-14 shrink-0 justify-center">
                                                <input
                                                    type="checkbox"
                                                    checked={line.done}
                                                    onChange={(event) =>
                                                        updateLine(line.key, {
                                                            done: event.target.checked,
                                                        })
                                                    }
                                                />
                                                <span className="sr-only">{t("done")}</span>
                                            </label>

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeLine(line.key)}
                                                aria-label={t("removeItem")}
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addLine}
                                    className="shrink-0 self-start"
                                >
                                    <Plus className="size-4" />
                                    {t("addItem")}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="flex shrink-0 items-center justify-between gap-2 border-t pt-4">
                <div className="flex min-w-0 items-center gap-3">
                    {reservation && deleteAction && (
                        <Button
                            type="submit"
                            formAction={deleteAction}
                            variant="destructive"
                            size="icon"
                        >
                            <Trash2 className="size-4" />
                            <span className="sr-only">{tCalendar("delete")}</span>
                        </Button>
                    )}

                    {(overviewActive ? grandTotal > 0 : active.lines.length > 0) && (
                        <div className="truncate text-sm text-muted-foreground">
                            {tCommon("total")}:{" "}
                            <span className="font-medium text-foreground">
                                {formatCurrency(overviewActive ? grandTotal : total, "EUR", locale)}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    <Link href={cancelHref} className={buttonVariants({ variant: "ghost" })}>
                        {tCommon("cancel")}
                    </Link>
                    <Button type="submit" disabled={!canSubmit}>
                        {isEdit
                            ? tCommon("save")
                            : isReservation
                              ? tCalendar("create")
                              : t("create")}
                    </Button>
                </div>
            </div>
        </form>
    );
}
