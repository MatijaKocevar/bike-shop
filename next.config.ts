import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
    allowedDevOrigins: ["10.8.0.4", "192.168.0.175"],
    serverExternalPackages: ["@react-pdf/renderer"],
    outputFileTracingIncludes: {
        "/api/receipts/[id]/pdf": ["./assets/fonts/**"],
    },
};

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(nextConfig);
