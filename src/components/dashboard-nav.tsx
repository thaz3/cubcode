"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import {
  DASHBOARD_MORE_ONLY_NAV_ITEMS,
  DASHBOARD_PRIMARY_NAV_ITEMS,
  isDashboardMoreNavActive,
  isDashboardNavActive,
} from "@/lib/dashboard-nav-items";
import { cn } from "@/lib/utils";
import { cubNavActive, cubNavInactive } from "@/lib/cub-theme";

type DashboardNavProps = {
  pendingReviewCount?: number;
  guardianNudgeCount?: number;
};

export function DashboardNav({
  pendingReviewCount = 0,
  guardianNudgeCount = 0,
}: DashboardNavProps) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  const moreActive = isDashboardMoreNavActive(pathname);

  return (
    <header className="sticky top-0 z-40 border-b border-cub-green/20 bg-cub-deep-black/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/dashboard"
          className="text-lg font-bold tracking-tight text-cub-off-white"
        >
          <span className="text-cub-gold-light">C.U.B.</span> Code
        </Link>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Main navigation"
        >
          {DASHBOARD_PRIMARY_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={navLinkClass(pathname, item.href)}
            >
              {item.label}
              {item.href === "/dashboard/tasks/review" &&
              pendingReviewCount > 0 ? (
                <span className="ml-1.5 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-cub-gold px-1.5 text-[10px] font-bold text-cub-ebony">
                  {pendingReviewCount}
                </span>
              ) : null}
              {item.href === "/dashboard" && guardianNudgeCount > 0 ? (
                <span className="ml-1.5 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-cub-red px-1.5 text-[10px] font-bold text-cub-off-white">
                  {guardianNudgeCount}
                </span>
              ) : null}
            </Link>
          ))}

          <div className="relative" ref={moreRef}>
            <button
              type="button"
              onClick={() => setMoreOpen((o) => !o)}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition",
                moreActive || moreOpen
                  ? cubNavActive
                  : cubNavInactive,
              )}
              aria-expanded={moreOpen}
              aria-haspopup="true"
            >
              More ▾
            </button>
            {moreOpen ? (
              <div className="absolute right-0 top-full z-50 mt-1 min-w-44 rounded-xl border border-cub-gold/25 bg-cub-charcoal py-1 shadow-xl shadow-black/40">
                {DASHBOARD_MORE_ONLY_NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "block px-4 py-2.5 text-sm transition hover:bg-cub-ebony",
                      isDashboardNavActive(pathname, item.href)
                        ? "bg-cub-gold-muted font-medium text-cub-gold-light"
                        : "text-cub-off-white/80",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="my-1 border-t border-cub-off-white/10" />
                <form action={logoutAction} className="px-2 pb-1">
                  <button
                    type="submit"
                    className="w-full rounded-lg px-2 py-2.5 text-left text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        </nav>

        <form action={logoutAction} className="hidden lg:block">
          <Button type="submit" variant="ghost" size="sm">
            Sign out
          </Button>
        </form>

        <form action={logoutAction} className="lg:hidden">
          <Button type="submit" variant="ghost" size="sm">
            Sign out
          </Button>
        </form>
      </div>
    </header>
  );
}

function navLinkClass(pathname: string, href: string) {
  const active = isDashboardNavActive(pathname, href);
  return cn(
    "inline-flex min-h-10 items-center rounded-lg px-3 py-2 text-sm font-medium transition",
    active ? cubNavActive : cubNavInactive,
  );
}
