import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { PARENT_UNLOCK_COOKIE } from "@/lib/parent-pin";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set(
    "x-pathname",
    req.nextUrl.pathname + req.nextUrl.search,
  );

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Cub view is kid-facing — end any parent unlock session on entry.
  if (req.nextUrl.pathname === "/cub" || req.nextUrl.pathname.startsWith("/cub/")) {
    response.cookies.delete(PARENT_UNLOCK_COOKIE);
  }

  return response;
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/cub/:path*",
    "/parent/:path*",
    "/login",
    "/signup",
  ],
};
