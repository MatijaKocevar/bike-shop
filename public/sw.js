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
