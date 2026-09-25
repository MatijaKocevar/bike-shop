"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import {
    Bike,
    CalendarDays,
    ClipboardList,
    Contact,
    LayoutDashboard,
    Package,
    Receipt,
    Settings,
    Users,
    LogOut,
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";

type AppSidebarProps = {
    email: string | null | undefined;
};

export function AppSidebar({ email }: AppSidebarProps) {
    const t = useTranslations("app.nav");
    const pathname = usePathname();
    const { setOpenMobile } = useSidebar();

    const closeMobile = () => setOpenMobile(false);

    const nav = [
        { href: "/", label: t("dashboard"), icon: LayoutDashboard, exact: true },
        { href: "/calendar", label: t("calendar"), icon: CalendarDays, exact: false },
        { href: "/tickets", label: t("tickets"), icon: ClipboardList, exact: false },
        { href: "/products", label: t("products"), icon: Package, exact: false },
        { href: "/receipts", label: t("receipts"), icon: Receipt, exact: false },
        { href: "/customers", label: t("customers"), icon: Contact, exact: false },
        { href: "/users", label: t("users"), icon: Users, exact: false },
        { href: "/settings", label: t("settings"), icon: Settings, exact: false },
    ];

    function isActive(item: (typeof nav)[number]) {
        return item.exact ? pathname === item.href : pathname.startsWith(item.href);
    }

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            render={<Link href="/" onClick={closeMobile} />}
                        >
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                <Bike className="size-4" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{t("shopName")}</span>
                                <span className="truncate text-xs">{t("shopSubtitle")}</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {nav.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton
                                        render={<Link href={item.href} onClick={closeMobile} />}
                                        isActive={isActive(item)}
                                        tooltip={item.label}
                                    >
                                        <item.icon />
                                        <span>{item.label}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex items-center justify-between gap-2 px-2 py-1">
                            <span className="truncate text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                                {email}
                            </span>
                            <div className="flex items-center gap-1">
                                <LanguageSwitcher />
                                <ThemeToggle />
                                <button
                                    type="button"
                                    onClick={() => signOut()}
                                    aria-label={t("signOut")}
                                    title={t("signOut")}
                                    className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
                                >
                                    <LogOut className="size-4" />
                                </button>
                            </div>
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
