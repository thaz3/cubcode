import { FAMILY_DAY_LABEL } from "@/lib/family-day-labels";

export const DASHBOARD_CORE_NAV_ITEMS = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/tasks", label: "Assignments" },
  { href: "/dashboard/tasks/review", label: "Review" },
  { href: "/dashboard/cubs", label: "Cubs" },
] as const;

export const DASHBOARD_EXTENDED_NAV_ITEMS = [
  { href: "/dashboard/rewards", label: "Rewards" },
  { href: "/dashboard/week", label: "This week" },
] as const;

/** Desktop top nav — core + extended links. */
export const DASHBOARD_PRIMARY_NAV_ITEMS = [
  ...DASHBOARD_CORE_NAV_ITEMS,
  ...DASHBOARD_EXTENDED_NAV_ITEMS,
] as const;

/** Mobile bottom bar — core links only; extended links live in More. */
export const DASHBOARD_MOBILE_PRIMARY_NAV_ITEMS = DASHBOARD_CORE_NAV_ITEMS;

export const DASHBOARD_MORE_ONLY_NAV_ITEMS = [
  { href: "/dashboard/family-day", label: FAMILY_DAY_LABEL },
  { href: "/dashboard/ways-to-earn", label: "Ways to Earn" },
  { href: "/dashboard/focus-deck", label: "Growth Picks" },
  { href: "/dashboard/tasks/templates", label: "Training Path" },
  { href: "/dashboard/family/settings", label: "Settings" },
] as const;

/** Mobile More sheet — extended + settings links. */
export const DASHBOARD_MOBILE_MORE_NAV_ITEMS = [
  ...DASHBOARD_EXTENDED_NAV_ITEMS,
  ...DASHBOARD_MORE_ONLY_NAV_ITEMS,
] as const;

export function isDashboardNavActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === "/dashboard") return false;
  if (href === "/dashboard/tasks") {
    return (
      pathname.startsWith("/dashboard/tasks/") &&
      !pathname.startsWith("/dashboard/tasks/review") &&
      !pathname.startsWith("/dashboard/tasks/templates")
    );
  }
  if (href === "/dashboard/focus-deck") {
    return pathname.startsWith("/dashboard/focus-deck");
  }
  if (href === "/dashboard/ways-to-earn") {
    return pathname.startsWith("/dashboard/ways-to-earn");
  }
  if (href === "/dashboard/family-day") {
    return (
      pathname.startsWith("/dashboard/family-day") ||
      pathname.startsWith("/dashboard/council-day")
    );
  }
  if (href === "/dashboard/week") {
    return pathname === "/dashboard/week" || pathname.startsWith("/dashboard/week/");
  }
  return pathname.startsWith(`${href}/`) || pathname === href;
}

export function isDashboardMoreNavActive(pathname: string): boolean {
  return DASHBOARD_MOBILE_MORE_NAV_ITEMS.some((item) =>
    isDashboardNavActive(pathname, item.href),
  );
}
