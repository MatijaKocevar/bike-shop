import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const proxy = auth((req) => {
    const { nextUrl } = req;

    if (!req.auth) {
        const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? nextUrl.host;
        const authProtocol = process.env.AUTH_URL
            ? new URL(process.env.AUTH_URL).protocol
            : nextUrl.protocol;
        const protocol = (req.headers.get("x-forwarded-proto") ?? authProtocol).replace(/:$/, "");
        const url = new URL(`${protocol}://${host}/signin`);
        url.searchParams.set("callbackUrl", nextUrl.pathname);

        return NextResponse.redirect(url);
    }

    return NextResponse.next();
});

export default proxy;

export const config = {
    matcher: ["/((?!api|signin|_next|.*\\..*).*)"],
};
