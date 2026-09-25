import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const proxy = auth((req) => {
    const { nextUrl } = req;

    if (!req.auth) {
        const origin = process.env.AUTH_URL ?? nextUrl.origin;
        const url = new URL("/signin", origin);
        url.searchParams.set("callbackUrl", nextUrl.pathname);

        return NextResponse.redirect(url);
    }

    return NextResponse.next();
});

export default proxy;

export const config = {
    matcher: ["/((?!api|signin|_next|.*\\..*).*)"],
};
