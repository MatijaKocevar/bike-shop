import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { ThemeColorSync } from "@/components/theme-color-sync";
import { ThemeProvider } from "@/components/theme-provider";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const viewport: Viewport = {
    colorScheme: "light dark",
};

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("metadata");

    return {
        title: {
            default: "Bike Shop",
            template: "%s · Bike Shop",
        },
        description: t("description"),
    };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
    const locale = await getLocale();
    const messages = await getMessages();

    return (
        <html
            lang={locale}
            suppressHydrationWarning
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        >
            <head>
                <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
            </head>
            <body className="flex min-h-full flex-col">
                <NextIntlClientProvider messages={messages}>
                    <ThemeProvider>
                        <ThemeColorSync />
                        {children}
                    </ThemeProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
