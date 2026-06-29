"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import {
  DASHBOARD_ASSIGNMENTS_SUB_NAV_ITEMS,
  DASHBOARD_ASSIGN_WORK_SUB_NAV_ITEMS,
  DASHBOARD_CORE_NAV_ITEMS,
  DASHBOARD_EXTENDED_NAV_ITEMS,
  DASHBOARD_USER_MENU_NAV_ITEMS,
  DASHBOARD_WAYS_TO_LEARN_NAV_ITEM,
  isDashboardAssignWorkNavActive,
  isDashboardAssignmentsNavActive,
  isDashboardNavActive,
  isDashboardUserMenuNavActive,
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
  const displayName = userName?.trim() || "Parent";
  const email = userEmail?.trim() || "";

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
              {DASHBOARD_CORE_NAV_ITEMS.map((item) => {
                if (item.href === "/dashboard/tasks") {
                  return (
                    <NavDropdown
                      key={item.href}
                      label={item.label}
                      pathname={pathname}
                      isActive={isDashboardAssignmentsNavActive(pathname)}
                      badge={
                        pendingReviewCount > 0 ? pendingReviewCount : null
                      }
                      items={[
                        { href: "/dashboard/tasks", label: "Assignment board" },
                        ...DASHBOARD_ASSIGNMENTS_SUB_NAV_ITEMS,
                      ]}
                    />
                  );
                }
                if (item.href === "/dashboard/tasks/assign") {
                  return (
                    <NavDropdown
                      key={item.href}
                      label={item.label}
                      pathname={pathname}
                      isActive={isDashboardAssignWorkNavActive(pathname)}
                      items={[
                        { href: "/dashboard/tasks/assign", label: "Assign work" },
                        ...DASHBOARD_ASSIGN_WORK_SUB_NAV_ITEMS,
                      ]}
                    />
                  );
                }
                return (
                  <NavLink
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    guardianNudgeCount={guardianNudgeCount}
                  />
                );
              })}
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

            <NavLink
              item={DASHBOARD_WAYS_TO_LEARN_NAV_ITEM}
              pathname={pathname}
            />
          </div>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
          <UserMenu
            displayName={displayName}
            email={email}
            pathname={pathname}
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

function UserMenu({
  displayName,
  email,
  pathname,
  className,
}: {
  displayName: string;
  email: string;
  pathname: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const initials = getInitials(displayName);
  const active = isDashboardUserMenuNavActive(pathname);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className={cn("relative", className)} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex max-w-[11rem] items-center gap-2.5 rounded-xl border px-2.5 py-1.5 transition xl:max-w-xs",
          active || open
            ? "border-cub-gold/40 bg-cub-gold-muted/30"
            : "border-cub-off-white/10 bg-cub-ebony/60 hover:border-cub-gold/25 hover:bg-cub-charcoal/80",
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        title={email || displayName}
      >
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cub-gold-muted text-xs font-bold text-cub-gold-light ring-1 ring-cub-gold/30"
          aria-hidden
        >
          {initials}
        </span>
        <span className="min-w-0 text-left">
          <span className="block truncate text-sm font-medium text-cub-off-white">
            {displayName}
          </span>
          {email ? (
            <span className="block truncate text-[11px] text-cub-muted">{email}</span>
          ) : null}
        </span>
        <ChevronIcon open={open} />
      </button>

      {open ? (
        <div
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-48 overflow-hidden rounded-2xl border border-cub-gold/20 bg-cub-charcoal py-1.5 shadow-2xl shadow-black/50"
          role="menu"
        >
          <MoreMenuSection label="Account">
            {DASHBOARD_USER_MENU_NAV_ITEMS.map((item) => (
              <MoreMenuLink key={item.href} item={item} pathname={pathname} />
            ))}
          </MoreMenuSection>
        </div>
      ) : null}
    </div>
  );
}

function NavDropdown({
  label,
  items,
  pathname,
  isActive,
  badge,
}: {
  label: string;
  items: Array<{ href: string; label: string }>;
  pathname: string;
  isActive: boolean;
  badge?: number | null;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "relative inline-flex min-h-9 items-center gap-1 whitespace-nowrap rounded-xl px-2.5 py-1.5 text-sm font-medium transition xl:px-3",
          isActive || open ? cubNavActive : cubNavInactive,
        )}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {label}
        {badge != null ? (
          <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-cub-gold px-1 text-[10px] font-bold text-cub-ebony">
            {badge > 9 ? "9+" : badge}
          </span>
        ) : null}
        <ChevronIcon open={open} />
      </button>

      {open ? (
        <div
          className="absolute left-0 top-[calc(100%+0.5rem)] z-50 min-w-48 overflow-hidden rounded-2xl border border-cub-gold/20 bg-cub-charcoal py-1.5 shadow-2xl shadow-black/50"
          role="menu"
        >
          {items.map((item) => (
            <MoreMenuLink key={item.href} item={item} pathname={pathname} />
          ))}
        </div>
      ) : null}
    </div>
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
        "mx-1.5 block rounded-xl px-3 py-2.5 text-sm transition",
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
        "h-3.5 w-3.5 shrink-0 text-current transition-transform duration-200",
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
  guardianNudgeCount = 0,
}: {
  item: NavItem;
  pathname: string;
  guardianNudgeCount?: number;
}) {
  const active = isDashboardNavActive(pathname, item.href);
  const badge =
    item.href === "/dashboard" && guardianNudgeCount > 0
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
