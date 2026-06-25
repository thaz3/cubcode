import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
    authorized: async ({ auth, request }) => {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const isAuthPage = pathname === "/login" || pathname === "/signup";
      const isDashboard = pathname.startsWith("/dashboard");
      const isCub = pathname.startsWith("/cub");
      const isParentGate = pathname.startsWith("/parent");

      if (isDashboard || isCub || isParentGate) {
        return isLoggedIn;
      }

      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/cub", request.nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
