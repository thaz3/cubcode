"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logoutAction } from "@/lib/actions/auth";
import {
  DASHBOARD_MORE_NAV_ITEMS,
  DASHBOARD_PRIMARY_NAV_ITEMS,
  isDashboardMoreNavActive,
  isDashboardNavActive,
} from "@/lib/dashboard-nav-items";
import { cn } from "@/lib/utils";

type MobileNavProps = {
  pendingReviewCount?: number;
};

export function MobileNav({ pendingReviewCount = 0 }: MobileNavProps) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = isDashboardMoreNavActive(pathname);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  return (
    <>
      {moreOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMoreOpen(false)}
        />
      ) : null}

      {moreOpen ? (
        <div
          className="fixed inset-x-0 z-50 border-t border-zinc-800 bg-zinc-900 px-2 py-2 shadow-lg lg:hidden"
          style={{
            bottom: "calc(3.5rem + env(safe-area-inset-bottom, 0px))",
          }}
          role="menu"
          aria-label="More navigation"
        >
          {DASHBOARD_MORE_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              className={cn(
                "block rounded-lg px-4 py-3 text-sm font-medium transition hover:bg-zinc-800",
                isDashboardNavActive(pathname, item.href)
                  ? "text-amber-500"
                  : "text-zinc-200",
              )}
            >
              {item.label}
            </Link>
          ))}
          <div className="my-1 border-t border-zinc-800" />
          <form action={logoutAction}>
            <button
              type="submit"
              role="menuitem"
              className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            >
              Log out
            </button>
          </form>
        </div>
      ) : null}

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        aria-label="Main navigation"
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1">
          {DASHBOARD_PRIMARY_NAV_ITEMS.map((item) => {
            const active = isDashboardNavActive(pathname, item.href);
            const badge =
              item.href === "/dashboard/tasks/review" && pendingReviewCount > 0
                ? pendingReviewCount
                : null;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-2 text-[11px] font-medium transition",
                  active ? "text-amber-500" : "text-zinc-500 hover:text-zinc-300",
                )}
              >
                <span className="relative">
                  {item.label}
                  {badge != null ? (
                    <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-600 px-1 text-[10px] font-bold text-white">
                      {badge > 9 ? "9+" : badge}
                    </span>
                  ) : null}
                </span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setMoreOpen((open) => !open)}
            className={cn(
              "flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-2 text-[11px] font-medium transition",
              moreActive || moreOpen
                ? "text-amber-500"
                : "text-zinc-500 hover:text-zinc-300",
            )}
            aria-expanded={moreOpen}
            aria-haspopup="menu"
          >
            More
          </button>
        </div>
      </nav>
    </>
  );
}
