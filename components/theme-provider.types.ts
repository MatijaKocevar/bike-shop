import type { ResolvedTheme, Theme } from "@/lib/theme.types";

export type ThemeContextValue = {
    theme: Theme;
    resolvedTheme: ResolvedTheme;
    systemTheme: ResolvedTheme;
    setTheme: (theme: Theme) => void;
};
