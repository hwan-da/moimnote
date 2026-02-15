import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const isAuthPage =
        req.nextUrl.pathname.startsWith("/login") ||
        req.nextUrl.pathname.startsWith("/register");

    // 로그인 안 했는데 보호된 페이지 접근 → 로그인 페이지로 이동
    if (!isLoggedIn && !isAuthPage) {
        return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    // 로그인 했는데 로그인/회원가입 페이지 접근 → 대시보드로 이동
    if (isLoggedIn && isAuthPage) {
        return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

export const runtime = "nodejs";