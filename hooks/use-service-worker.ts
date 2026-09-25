import { useEffect } from "react";

export function useServiceWorker() {
    useEffect(() => {
        if (process.env.NODE_ENV !== "production") return;
        if (!("serviceWorker" in navigator)) return;

        navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }, []);
}
