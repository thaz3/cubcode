"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PRIMARY_ITEMS = [
  { href: "/dashboard", label: "Today" },
  { href: "/dashboard/tasks", label: "Tasks" },
  { href: "/dashboard/tasks/review", label: "Review" },
  { href: "/dashboard/cubs", label: "Cubs" },
  { href: "/dashboard/family/settings", label: "Settings" },
];

const MORE_ITEMS = [
  { href: "/dashboard/week", label: "This week" },
  { href: "/dashboard/family-day", label: "Family Day" },
  { href: "/dashboard/rewards", label: "Reward Store" },
  { href: "/dashboard/tasks/summer", label: "Summer tasks" },
  { href: "/dashboard/tasks/templates", label: "Task templates" },
];

type DashboardNavProps = {
  pendingReviewCount?: number;
};

export function DashboardNav({
  pendingReviewCount = 0,
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

  const moreActive = MORE_ITEMS.some((item) => isActive(pathname, item.href));

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/dashboard" className="text-lg font-bold text-zinc-50">
          C.U.B. Code
        </Link>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Main navigation"
        >
          {PRIMARY_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={navLinkClass(pathname, item.href)}
            >
              {item.label}
              {item.href === "/dashboard/tasks/review" &&
              pendingReviewCount > 0 ? (
                <span className="ml-1.5 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-amber-600 px-1.5 text-[10px] font-bold text-white">
                  {pendingReviewCount}
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
                  ? "text-amber-500"
                  : "text-zinc-400 hover:text-zinc-100",
              )}
              aria-expanded={moreOpen}
              aria-haspopup="true"
            >
              More ▾
            </button>
            {moreOpen ? (
              <div className="absolute right-0 top-full z-50 mt-1 min-w-44 rounded-xl border border-zinc-800 bg-zinc-900 py-1 shadow-lg">
                {MORE_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "block px-4 py-2.5 text-sm transition hover:bg-zinc-800",
                      isActive(pathname, item.href)
                        ? "text-amber-500"
                        : "text-zinc-300",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="my-1 border-t border-zinc-800" />
                <form action={logoutAction} className="px-2 pb-1">
                  <button
                    type="submit"
                    className="w-full rounded-lg px-2 py-2.5 text-left text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                  >
                    Log out
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        </nav>

        <form action={logoutAction} className="hidden lg:block">
          <Button type="submit" variant="ghost" size="sm">
            Log out
          </Button>
        </form>

        <form action={logoutAction} className="lg:hidden">
          <Button type="submit" variant="ghost" size="sm">
            Out
          </Button>
        </form>
      </div>
    </header>
  );
}

function isActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === "/dashboard") return false;
  if (href === "/dashboard/tasks") {
    return (
      pathname.startsWith("/dashboard/tasks/") &&
      !pathname.startsWith("/dashboard/tasks/review") &&
      !pathname.startsWith("/dashboard/tasks/summer") &&
      !pathname.startsWith("/dashboard/tasks/templates")
    );
  }
  if (href === "/dashboard/family-day") {
    return (
      pathname.startsWith("/dashboard/family-day") ||
      pathname.startsWith("/dashboard/council-day")
    );
  }
  return pathname.startsWith(`${href}/`) || pathname === href;
}

function navLinkClass(pathname: string, href: string) {
  const active = isActive(pathname, href);
  return cn(
    "inline-flex min-h-10 items-center rounded-lg px-3 py-2 text-sm font-medium transition",
    active ? "text-amber-500" : "text-zinc-400 hover:text-zinc-100",
  );
}
