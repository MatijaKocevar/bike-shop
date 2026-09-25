import type { ResolvedTheme, Theme } from "@/lib/theme.types";

export const THEME_STORAGE_KEY = "theme";
export const THEME_DARK_QUERY = "(prefers-color-scheme: dark)";

export function resolveTheme(theme: Theme, prefersDark: boolean): ResolvedTheme {
    if (theme === "system") return prefersDark ? "dark" : "light";

    return theme;
}

export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");var d=t==="dark"||((!t||t==="system")&&window.matchMedia("${THEME_DARK_QUERY}").matches);var r=d?"dark":"light";document.documentElement.classList.add(r);document.documentElement.style.colorScheme=r}catch(e){}})();`;
