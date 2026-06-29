"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import {
  DASHBOARD_CORE_NAV_ITEMS,
  DASHBOARD_EXTENDED_NAV_ITEMS,
  DASHBOARD_MORE_ACCOUNT_NAV_ITEMS,
  DASHBOARD_MORE_EXPLORE_NAV_ITEMS,
  isDashboardMoreNavActive,
  isDashboardNavActive,
} from "@/lib/dashboard-nav-items";
import { cn } from "@/lib/utils";
import { cubNavActive, cubNavInactive } from "@/lib/cub-theme";

type DashboardNavProps = {
  pendingReviewCount?: number;
  guardianNudgeCount?: number;
  userName?: string | null;
  userEmail?: string | null;
};

export function DashboardNav({
  pendingReviewCount = 0,
  guardianNudgeCount = 0,
  userName,
  userEmail,
}: DashboardNavProps) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const displayName = userName?.trim() || "Parent";
  const email = userEmail?.trim() || "";

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
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
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 sm:gap-4 lg:py-3">
        <Link
          href="/dashboard"
          className="group flex shrink-0 items-center gap-2 rounded-xl py-1 pr-2 transition hover:opacity-90"
        >
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-cub-gold/30 bg-cub-gold-muted text-sm font-black text-cub-gold-light shadow-sm shadow-cub-gold/10"
            aria-hidden
          >
            C
          </span>
          <span className="hidden text-base font-bold tracking-tight text-cub-off-white sm:inline">
            <span className="text-cub-gold-light">C.U.B.</span> Code
          </span>
        </Link>

        <nav
          className="hidden min-w-0 flex-1 justify-center lg:flex"
          aria-label="Main navigation"
        >
          <div className="flex max-w-full items-center gap-1 rounded-2xl border border-cub-off-white/10 bg-cub-ebony/70 p-1 shadow-inner shadow-black/20">
            <NavGroup>
              {DASHBOARD_CORE_NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  pendingReviewCount={pendingReviewCount}
                  guardianNudgeCount={guardianNudgeCount}
                />
              ))}
            </NavGroup>

            {DASHBOARD_EXTENDED_NAV_ITEMS.length > 0 ? (
              <>
                <NavDivider />
                <NavGroup>
                  {DASHBOARD_EXTENDED_NAV_ITEMS.map((item) => (
                    <NavLink key={item.href} item={item} pathname={pathname} />
                  ))}
                </NavGroup>
              </>
            ) : null}

            <NavDivider />

            <div className="relative" ref={moreRef}>
              <button
                type="button"
                onClick={() => setMoreOpen((open) => !open)}
                className={cn(
                  "inline-flex min-h-9 items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cub-gold/50",
                  moreActive || moreOpen ? cubNavActive : cubNavInactive,
                )}
                aria-expanded={moreOpen}
                aria-haspopup="menu"
              >
                More
                <ChevronIcon open={moreOpen} />
              </button>

              {moreOpen ? (
                <div
                  className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-52 overflow-hidden rounded-2xl border border-cub-gold/20 bg-cub-charcoal py-1.5 shadow-2xl shadow-black/50"
                  role="menu"
                >
                  <MoreMenuSection label="Account">
                    {DASHBOARD_MORE_ACCOUNT_NAV_ITEMS.map((item) => (
                      <MoreMenuLink
                        key={item.href}
                        item={item}
                        pathname={pathname}
                      />
                    ))}
                  </MoreMenuSection>
                  <MoreMenuSection label="Explore">
                    {DASHBOARD_MORE_EXPLORE_NAV_ITEMS.map((item) => (
                      <MoreMenuLink
                        key={item.href}
                        item={item}
                        pathname={pathname}
                      />
                    ))}
                  </MoreMenuSection>
                </div>
              ) : null}
            </div>
          </div>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
          <SignedInUser
            displayName={displayName}
            email={email}
            className="hidden lg:flex"
          />
          <form action={logoutAction}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="text-cub-muted hover:text-cub-off-white"
            >
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}

function SignedInUser({
  displayName,
  email,
  className,
}: {
  displayName: string;
  email: string;
  className?: string;
}) {
  const initials = getInitials(displayName);

  return (
    <Link
      href="/dashboard/family/settings"
      className={cn(
        "max-w-[11rem] items-center gap-2.5 rounded-xl border border-cub-off-white/10 bg-cub-ebony/60 px-2.5 py-1.5 transition hover:border-cub-gold/25 hover:bg-cub-charcoal/80 xl:max-w-xs",
        className,
      )}
      title={email || displayName}
    >
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cub-gold-muted text-xs font-bold text-cub-gold-light ring-1 ring-cub-gold/30"
        aria-hidden
      >
        {initials}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-cub-off-white">
          {displayName}
        </span>
        {email ? (
          <span className="block truncate text-[11px] text-cub-muted">{email}</span>
        ) : null}
      </span>
    </Link>
  );
}

function MoreMenuSection({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="px-1.5 pb-1">
      <p className="px-3 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-cub-muted">
        {label}
      </p>
      {children}
    </div>
  );
}

function MoreMenuLink({
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
        "mx-0 block rounded-xl px-3 py-2.5 text-sm transition",
        isDashboardNavActive(pathname, item.href)
          ? "bg-cub-gold-muted font-medium text-cub-gold-light"
          : "text-cub-off-white/85 hover:bg-cub-ebony hover:text-cub-off-white",
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

function NavGroup({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>;
}

function NavDivider() {
  return (
    <span
      className="mx-0.5 hidden h-5 w-px shrink-0 bg-cub-off-white/12 sm:block"
      aria-hidden
    />
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden
      className={cn(
        "h-3.5 w-3.5 text-current transition-transform duration-200",
        open && "rotate-180",
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

type NavItem = {
  href: string;
  label: string;
};

function NavLink({
  item,
  pathname,
  pendingReviewCount = 0,
  guardianNudgeCount = 0,
}: {
  item: NavItem;
  pathname: string;
  pendingReviewCount?: number;
  guardianNudgeCount?: number;
}) {
  const active = isDashboardNavActive(pathname, item.href);
  const badge =
    item.href === "/dashboard/tasks/review" && pendingReviewCount > 0
      ? pendingReviewCount
      : item.href === "/dashboard" && guardianNudgeCount > 0
        ? guardianNudgeCount
        : null;

  return (
    <Link
      href={item.href}
      className={cn(
        "relative inline-flex min-h-9 items-center whitespace-nowrap rounded-xl px-2.5 py-1.5 text-sm font-medium transition xl:px-3",
        active ? cubNavActive : cubNavInactive,
      )}
    >
      {item.label}
      {badge != null ? (
        <span
          className={cn(
            "ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold",
            item.href === "/dashboard"
              ? "bg-cub-red text-cub-off-white"
              : "bg-cub-gold text-cub-ebony",
          )}
        >
          {badge > 9 ? "9+" : badge}
        </span>
      ) : null}
    </Link>
  );
}
