"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/week", label: "This week" },
  { href: "/dashboard/tasks", label: "Tasks" },
  { href: "/dashboard/tasks/summer", label: "Summer" },
  { href: "/dashboard/tasks/review", label: "Review" },
  { href: "/dashboard/family-day", label: "Family Day" },
  { href: "/dashboard/cubs", label: "Cubs" },
  { href: "/dashboard/rewards", label: "Rewards" },
  { href: "/dashboard/family/settings", label: "Settings" },
];

export function DashboardNav({
  pendingReviewCount = 0,
}: {
  pendingReviewCount?: number;
}) {
  const pathname = usePathname();

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <div>
          <Link
            href="/dashboard"
            className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
          >
            C.U.B. Code
          </Link>
          <p className="text-xs text-zinc-500">Milestone 4 · Reflection + Summer Lite</p>
        </div>

        <nav className="hidden items-center gap-4 sm:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={navLinkClass(pathname, item.href)}
            >
              {item.label}
              {item.href === "/dashboard/tasks/review" && pendingReviewCount > 0 ? (
                <span className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-amber-600 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                  {pendingReviewCount}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>

        <form action={logoutAction}>
          <Button type="submit" variant="ghost">
            Log out
          </Button>
        </form>
      </div>

      <nav className="mx-auto flex max-w-5xl gap-4 overflow-x-auto px-4 pb-3 sm:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`whitespace-nowrap ${navLinkClass(pathname, item.href)}`}
          >
            {item.label}
            {item.href === "/dashboard/tasks/review" && pendingReviewCount > 0 ? (
              <span className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-amber-600 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                {pendingReviewCount}
              </span>
            ) : null}
          </Link>
        ))}
      </nav>
    </header>
  );
}

function navLinkClass(pathname: string, href: string) {
  let active = pathname === href;

  if (!active && href !== "/dashboard") {
    if (href === "/dashboard/tasks") {
      active =
        pathname.startsWith("/dashboard/tasks/") &&
        !pathname.startsWith("/dashboard/tasks/review") &&
        !pathname.startsWith("/dashboard/tasks/summer");
    } else if (href === "/dashboard/tasks/summer") {
      active = pathname.startsWith("/dashboard/tasks/summer");
    } else if (href === "/dashboard/family-day") {
      active =
        pathname.startsWith("/dashboard/family-day") ||
        pathname.startsWith("/dashboard/council-day");
    } else {
      active = pathname.startsWith(`${href}/`);
    }
  }

  return active
    ? "text-sm font-medium text-amber-700"
    : "text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100";
}
