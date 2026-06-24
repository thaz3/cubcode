import { FAMILY_DAY_LABEL } from "@/lib/family-day-labels";

export const DASHBOARD_PRIMARY_NAV_ITEMS = [
  { href: "/dashboard", label: "Today" },
  { href: "/dashboard/tasks", label: "Tasks" },
  { href: "/dashboard/tasks/review", label: "Review" },
  { href: "/dashboard/cubs", label: "Cubs" },
  { href: "/dashboard/family/settings", label: "Settings" },
] as const;

export const DASHBOARD_MORE_NAV_ITEMS = [
  { href: "/dashboard/week", label: "This week" },
  { href: "/dashboard/family-day", label: FAMILY_DAY_LABEL },
  { href: "/dashboard/rewards", label: "Reward Store" },
  { href: "/dashboard/tasks/summer", label: "Summer tasks" },
  { href: "/dashboard/tasks/templates", label: "Task templates" },
] as const;

export function isDashboardNavActive(pathname: string, href: string): boolean {
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

export function isDashboardMoreNavActive(pathname: string): boolean {
  return DASHBOARD_MORE_NAV_ITEMS.some((item) =>
    isDashboardNavActive(pathname, item.href),
  );
}
