"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

const NAVIGABLE_SEGMENTS = [
    "calendar",
    "tickets",
    "products",
    "receipts",
    "customers",
    "users",
    "settings",
    "new",
];

export function AppBreadcrumbs() {
    const pathname = usePathname();
    const t = useTranslations("app.nav");

    const segments = pathname.split("/").filter(Boolean);

    const crumbs = segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const navigable = NAVIGABLE_SEGMENTS.includes(segment);

        return {
            href,
            label: navigable && segment !== "new" ? t(segment) : segment,
            navigable,
        };
    });

    const all = [{ href: "/", label: t("dashboard"), navigable: true }, ...crumbs];

    return (
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-sm">
            {all.map((crumb, index) => {
                const isLast = index === all.length - 1;

                return (
                    <span key={crumb.href} className="flex min-w-0 items-center gap-1">
                        {index > 0 && (
                            <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
                        )}
                        {isLast ? (
                            <span className="truncate font-medium">{crumb.label}</span>
                        ) : crumb.navigable ? (
                            <Link
                                href={crumb.href}
                                className="shrink-0 text-muted-foreground hover:text-foreground"
                            >
                                {crumb.label}
                            </Link>
                        ) : (
                            <span className="shrink-0 text-muted-foreground">{crumb.label}</span>
                        )}
                    </span>
                );
            })}
        </nav>
    );
}
