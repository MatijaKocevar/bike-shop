const CACHE_NAME = "bike-shop-v1";

self.addEventListener("install", () => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
                ),
            ),
    );

    event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;

    event.respondWith(fetch(event.request));
});

self.addEventListener("push", (event) => {
    let payload = { title: "Bicikl Kočevar", body: "", url: "/" };

    if (event.data) {
        try {
            payload = { ...payload, ...event.data.json() };
        } catch {
            payload.body = event.data.text();
        }
    }

    event.waitUntil(
        self.registration.showNotification(payload.title, {
            body: payload.body,
            icon: "/icons/icon-192.png",
            badge: "/icons/icon-192.png",
            data: { url: payload.url },
        }),
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const url = (event.notification.data && event.notification.data.url) || "/";

    event.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
            for (const client of clients) {
                if ("focus" in client) {
                    client.navigate(url);

                    return client.focus();
                }
            }

            return self.clients.openWindow(url);
        }),
    );
});
