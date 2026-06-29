import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set(
    "x-pathname",
    req.nextUrl.pathname + req.nextUrl.search,
  );

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/cub/:path*",
    "/parent/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ],
};
