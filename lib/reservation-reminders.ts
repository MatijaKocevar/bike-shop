import { createTranslator } from "next-intl";
import { defaultLocale } from "@/i18n/config";
import { formatTime, parseDateKey } from "@/lib/dates";
import { sendPush } from "@/lib/push";
import { deletePushSubscriptions, listPushSubscriptions } from "@/queries/push-subscriptions";
import {
    listReservationReminderCandidates,
    markReservationsReminded,
} from "@/queries/reservation-reminders";
import type { ReservationReminder } from "@/queries/reservation-reminders.types";

const TIME_ZONE = "Europe/Ljubljana";
const CHECK_INTERVAL_MS = 60_000;
const LEAD_MINUTES = 60;
const WINDOW_MINUTES = 5;

const messageLoaders = {
    en: () => import("@/messages/en.json"),
    sl: () => import("@/messages/sl.json"),
};

let started = false;
let running = false;

export function startReservationReminders() {
    if (started) return;

    started = true;
    void runReminderCheck();

    setInterval(() => void runReminderCheck(), CHECK_INTERVAL_MS);
}

async function runReminderCheck() {
    if (running) return;

    running = true;

    try {
        await sendDueReminders();
    } catch (error) {
        console.error("Reservation reminder check failed.", error);
    } finally {
        running = false;
    }
}

async function sendDueReminders() {
    const now = Date.now();
    const from = now + (LEAD_MINUTES - WINDOW_MINUTES) * 60_000;
    const to = now + (LEAD_MINUTES + WINDOW_MINUTES) * 60_000;
    const dateRange = [
        dateKeyInZone(new Date(from), TIME_ZONE),
        dateKeyInZone(new Date(to), TIME_ZONE),
    ];
    const candidates = await listReservationReminderCandidates(dateRange[0], dateRange[1]);
    const due = candidates.filter((reservation) => {
        const start = reservationStart(reservation).getTime();

        return start >= from && start <= to;
    });

    if (due.length === 0) return;

    const subscriptions = await listPushSubscriptions();
    const t = await reminderTranslator();
    const staleIds = new Set<string>();

    for (const reservation of due) {
        const payload = {
            title: t("reservationTitle"),
            body: reminderBody(reservation),
            url: `/calendar?month=${reservation.date.slice(0, 7)}&id=${reservation.id}`,
        };

        for (const subscription of subscriptions) {
            const result = await sendPush(subscription, payload);

            if (result === "stale") staleIds.add(subscription.id);
        }
    }

    await deletePushSubscriptions([...staleIds]);
    await markReservationsReminded(due.map((reservation) => reservation.id));
}

async function reminderTranslator() {
    const messages = (await messageLoaders[defaultLocale]()).default;

    return createTranslator({ locale: defaultLocale, messages, namespace: "notifications" });
}

function reminderBody(reservation: ReservationReminder): string {
    const parts = [formatTime(reservation.startMinutes)];

    if (reservation.customerName) parts.push(reservation.customerName);
    if (reservation.bikeName) parts.push(reservation.bikeName);

    return parts.join(" · ");
}

function reservationStart(reservation: ReservationReminder): Date {
    const { year, month, day } = parseDateKey(reservation.date);
    const hours = Math.floor(reservation.startMinutes / 60);
    const minutes = reservation.startMinutes % 60;
    const utc = Date.UTC(year, month - 1, day, hours, minutes);
    let timestamp = utc;

    for (let attempt = 0; attempt < 2; attempt += 1) {
        timestamp = utc - timeZoneOffsetMs(new Date(timestamp));
    }

    return new Date(timestamp);
}

function timeZoneOffsetMs(date: Date): number {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: TIME_ZONE,
        hour12: false,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).formatToParts(date);
    const values = new Map(parts.map((part) => [part.type, Number(part.value)]));
    const asUtc = Date.UTC(
        values.get("year") ?? 0,
        (values.get("month") ?? 1) - 1,
        values.get("day") ?? 1,
        (values.get("hour") ?? 0) % 24,
        values.get("minute") ?? 0,
        values.get("second") ?? 0,
    );

    return asUtc - date.getTime();
}

function dateKeyInZone(date: Date, timeZone: string): string {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date);
}
