import { FAMILY_DAY_LABEL } from "@/lib/family-day-labels";

export const DASHBOARD_CORE_NAV_ITEMS = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/tasks", label: "Assignments" },
  { href: "/dashboard/tasks/assign", label: "Assign work" },
] as const;

export const DASHBOARD_EXTENDED_NAV_ITEMS = [
  { href: "/dashboard/week", label: "This week" },
] as const;

/** Desktop top nav — core + extended links. */
export const DASHBOARD_PRIMARY_NAV_ITEMS = [
  ...DASHBOARD_CORE_NAV_ITEMS,
  ...DASHBOARD_EXTENDED_NAV_ITEMS,
] as const;

/** Mobile bottom bar — core links only; extended links live in More. */
export const DASHBOARD_MOBILE_PRIMARY_NAV_ITEMS = DASHBOARD_CORE_NAV_ITEMS;

export const DASHBOARD_USER_MENU_NAV_ITEMS = [
  { href: "/dashboard/cubs", label: "Cubs" },
  { href: "/dashboard/rewards", label: "Rewards" },
  { href: "/dashboard/family/settings", label: "Settings" },
] as const;

/** @deprecated Use DASHBOARD_USER_MENU_NAV_ITEMS */
export const DASHBOARD_MORE_ACCOUNT_NAV_ITEMS = DASHBOARD_USER_MENU_NAV_ITEMS;

export const DASHBOARD_ASSIGNMENTS_SUB_NAV_ITEMS = [
  { href: "/dashboard/tasks/templates", label: "Training Path" },
  { href: "/dashboard/family-day", label: FAMILY_DAY_LABEL },
] as const;

export const DASHBOARD_ASSIGN_WORK_SUB_NAV_ITEMS = [
  { href: "/dashboard/focus-deck", label: "Growth Picks" },
] as const;

export const DASHBOARD_WAYS_TO_LEARN_NAV_ITEM = {
  href: "/dashboard/ways-to-earn",
  label: "Ways to Learn",
} as const;

/** @deprecated Use DASHBOARD_WAYS_TO_LEARN_NAV_ITEM */
export const DASHBOARD_MORE_EXPLORE_NAV_ITEMS = [DASHBOARD_WAYS_TO_LEARN_NAV_ITEM] as const;

export const DASHBOARD_MORE_ONLY_NAV_ITEMS = [DASHBOARD_WAYS_TO_LEARN_NAV_ITEM] as const;

/** Mobile bottom bar — core links + Ways to Learn. */
export const DASHBOARD_MOBILE_BOTTOM_NAV_ITEMS = [
  ...DASHBOARD_CORE_NAV_ITEMS,
  DASHBOARD_WAYS_TO_LEARN_NAV_ITEM,
] as const;

/** Mobile Account sheet — overflow links (not on bottom bar). */
export const DASHBOARD_MOBILE_MORE_NAV_ITEMS = [
  ...DASHBOARD_EXTENDED_NAV_ITEMS,
  ...DASHBOARD_ASSIGNMENTS_SUB_NAV_ITEMS,
  ...DASHBOARD_ASSIGN_WORK_SUB_NAV_ITEMS,
  ...DASHBOARD_USER_MENU_NAV_ITEMS,
] as const;

export function isDashboardNavActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === "/dashboard") return false;
  if (href === "/dashboard/tasks") {
    return isDashboardAssignmentsNavActive(pathname);
  }
  if (href === "/dashboard/tasks/assign") {
    return isDashboardAssignWorkNavActive(pathname);
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

export function isDashboardAssignmentsNavActive(pathname: string): boolean {
  if (
    pathname === "/dashboard/family-day" ||
    pathname.startsWith("/dashboard/council-day")
  ) {
    return true;
  }
  if (pathname.startsWith("/dashboard/tasks/assign")) {
    return false;
  }
  if (pathname.startsWith("/dashboard/focus-deck")) {
    return false;
  }
  return pathname === "/dashboard/tasks" || pathname.startsWith("/dashboard/tasks/");
}

export function isDashboardAssignWorkNavActive(pathname: string): boolean {
  return (
    pathname.startsWith("/dashboard/tasks/assign") ||
    pathname.startsWith("/dashboard/focus-deck")
  );
}

export function isDashboardUserMenuNavActive(pathname: string): boolean {
  return DASHBOARD_USER_MENU_NAV_ITEMS.some((item) =>
    isDashboardNavActive(pathname, item.href),
  );
}

export function isDashboardMoreNavActive(pathname: string): boolean {
  return isDashboardNavActive(pathname, DASHBOARD_WAYS_TO_LEARN_NAV_ITEM.href);
}

/** @deprecated Use isDashboardMoreNavActive */
export const isDashboardWaysToLearnNavActive = isDashboardMoreNavActive;

export function isDashboardMobileAccountNavActive(pathname: string): boolean {
  return DASHBOARD_MOBILE_MORE_NAV_ITEMS.some((item) =>
    isDashboardNavActive(pathname, item.href),
  );
}

/** @deprecated Use isDashboardMobileAccountNavActive */
export const isDashboardMobileMoreNavActive = isDashboardMobileAccountNavActive;
