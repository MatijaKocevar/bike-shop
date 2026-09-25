"use client";

import {
    createContext,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import type { ThemeContextValue } from "@/components/theme-provider.types";
import { THEME_DARK_QUERY, THEME_STORAGE_KEY } from "@/lib/theme";
import type { ResolvedTheme, Theme } from "@/lib/theme.types";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export const ThemeContext = createContext<ThemeContextValue | null>(null);

type ThemeProviderProps = {
    children: React.ReactNode;
};

function readStoredTheme(): Theme {
    if (typeof window === "undefined") return "system";

    try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);

        if (stored === "light" || stored === "dark" || stored === "system") return stored;
    } catch {
        return "system";
    }

    return "system";
}

function readSystemTheme(): ResolvedTheme {
    if (typeof window === "undefined") return "light";

    return window.matchMedia(THEME_DARK_QUERY).matches ? "dark" : "light";
}

function applyTheme(theme: ResolvedTheme) {
    const root = document.documentElement;

    root.classList.remove("light", "dark");
    root.classList.add(theme);
    root.style.colorScheme = theme;
}

function persistTheme(theme: Theme) {
    try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
        return;
    }
}

function disableTransitionsDuringUpdate(): () => void {
    const style = document.createElement("style");

    style.appendChild(
        document.createTextNode(
            "*,*::before,*::after{-webkit-transition:none!important;transition:none!important}",
        ),
    );
    document.head.appendChild(style);

    return () => {
        window.getComputedStyle(document.body);
        setTimeout(() => style.remove(), 1);
    };
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [theme, setThemeState] = useState<Theme>(readStoredTheme);
    const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(readSystemTheme);
    const skipTransitions = useRef(false);
    const resolvedTheme = theme === "system" ? systemTheme : theme;

    useIsomorphicLayoutEffect(() => {
        const restore = skipTransitions.current ? disableTransitionsDuringUpdate() : null;

        skipTransitions.current = false;
        applyTheme(resolvedTheme);
        restore?.();
    }, [resolvedTheme]);

    useEffect(() => {
        const media = window.matchMedia(THEME_DARK_QUERY);

        function handleChange(event: MediaQueryListEvent) {
            setSystemTheme(event.matches ? "dark" : "light");
        }

        media.addEventListener("change", handleChange);

        return () => media.removeEventListener("change", handleChange);
    }, []);

    useEffect(() => {
        function handleStorage(event: StorageEvent) {
            if (event.key !== THEME_STORAGE_KEY) return;

            setThemeState(readStoredTheme());
        }

        window.addEventListener("storage", handleStorage);

        return () => window.removeEventListener("storage", handleStorage);
    }, []);

    const setTheme = useCallback((next: Theme) => {
        skipTransitions.current = true;
        setThemeState(next);
        persistTheme(next);
    }, []);

    const value = useMemo(
        () => ({ theme, resolvedTheme, systemTheme, setTheme }),
        [theme, resolvedTheme, systemTheme, setTheme],
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
