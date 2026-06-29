"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logoutAction } from "@/lib/actions/auth";
import {
  DASHBOARD_EXTENDED_NAV_ITEMS,
  DASHBOARD_MOBILE_PRIMARY_NAV_ITEMS,
  DASHBOARD_MORE_ACCOUNT_NAV_ITEMS,
  DASHBOARD_MORE_EXPLORE_NAV_ITEMS,
  isDashboardMobileMoreNavActive,
  isDashboardNavActive,
} from "@/lib/dashboard-nav-items";
import { cn } from "@/lib/utils";
import { cubNavActive, cubNavInactive } from "@/lib/cub-theme";

type MobileNavProps = {
  pendingReviewCount?: number;
  guardianNudgeCount?: number;
  userName?: string | null;
  userEmail?: string | null;
};

export function MobileNav({
  pendingReviewCount = 0,
  guardianNudgeCount = 0,
  userName,
  userEmail,
}: MobileNavProps) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = isDashboardMobileMoreNavActive(pathname);
  const displayName = userName?.trim() || "Parent";
  const email = userEmail?.trim() || "";

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
          className="fixed inset-x-0 z-50 border-t border-cub-green/20 bg-cub-deep-black/95 px-2 py-2 shadow-xl shadow-black/40 lg:hidden"
          style={{
            bottom: "var(--mobile-nav-safe-bottom)",
          }}
          role="menu"
          aria-label="More navigation"
        >
          <Link
            href="/dashboard/family/settings"
            className="mx-1 mb-2 flex items-center gap-3 rounded-xl border border-cub-off-white/10 bg-cub-charcoal/80 px-3 py-3"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cub-gold-muted text-sm font-bold text-cub-gold-light">
              {getInitials(displayName)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-cub-off-white">
                {displayName}
              </span>
              {email ? (
                <span className="block truncate text-xs text-cub-muted">{email}</span>
              ) : (
                <span className="block text-xs text-cub-muted">Signed in</span>
              )}
            </span>
          </Link>

          {DASHBOARD_EXTENDED_NAV_ITEMS.map((item) => (
            <MobileMoreLink key={item.href} item={item} pathname={pathname} />
          ))}

          <p className="px-4 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-cub-muted">
            Account
          </p>
          {DASHBOARD_MORE_ACCOUNT_NAV_ITEMS.map((item) => (
            <MobileMoreLink key={item.href} item={item} pathname={pathname} />
          ))}

          <p className="px-4 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-cub-muted">
            Explore
          </p>
          {DASHBOARD_MORE_EXPLORE_NAV_ITEMS.map((item) => (
            <MobileMoreLink key={item.href} item={item} pathname={pathname} />
          ))}

          <div className="my-1 border-t border-cub-off-white/10" />
          <form action={logoutAction}>
            <button
              type="submit"
              role="menuitem"
              className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            >
              Sign out
            </button>
          </form>
        </div>
      ) : null}

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-cub-green/20 bg-cub-deep-black/95 backdrop-blur-md lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        aria-label="Main navigation"
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1">
          {DASHBOARD_MOBILE_PRIMARY_NAV_ITEMS.map((item) => {
            const active = isDashboardNavActive(pathname, item.href);
            const badge =
              item.href === "/dashboard/tasks/review" && pendingReviewCount > 0
                ? pendingReviewCount
                : item.href === "/dashboard" && guardianNudgeCount > 0
                  ? guardianNudgeCount
                  : null;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-2 text-[11px] font-medium transition",
                  active ? cn(cubNavActive, "text-[11px]") : cn(cubNavInactive, "text-[11px]"),
                )}
              >
                <span className="relative">
                  {item.label}
                  {badge != null ? (
                    <span
                      className={cn(
                        "absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white",
                        item.href === "/dashboard"
                          ? "bg-cub-red"
                          : "bg-cub-gold text-cub-ebony",
                      )}
                    >
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
                ? cn(cubNavActive, "text-[11px]")
                : cn(cubNavInactive, "text-[11px]"),
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

function MobileMoreLink({
  item,
  pathname,
}: {
  item: { href: string; label: string };
  pathname: string;
}) {
  return (
    <Link
      href={item.href}
      role="menuitem"
      className={cn(
        "block rounded-lg px-4 py-3 text-sm font-medium transition hover:bg-zinc-800",
        isDashboardNavActive(pathname, item.href)
          ? "text-cub-gold"
          : "text-zinc-200",
      )}
    >
      {item.label}
    </Link>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "P";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}
