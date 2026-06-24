"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const PRIMARY_ITEMS = [
  { href: "/dashboard", label: "Today", match: (p: string) => p === "/dashboard" },
  {
    href: "/dashboard/tasks",
    label: "Tasks",
    match: (p: string) =>
      p.startsWith("/dashboard/tasks") &&
      !p.startsWith("/dashboard/tasks/review") &&
      !p.startsWith("/dashboard/tasks/summer"),
  },
  {
    href: "/dashboard/tasks/review",
    label: "Review",
    match: (p: string) => p.startsWith("/dashboard/tasks/review"),
    badgeKey: "review" as const,
  },
  {
    href: "/dashboard/cubs",
    label: "Cubs",
    match: (p: string) => p.startsWith("/dashboard/cubs"),
  },
  {
    href: "/dashboard/family/settings",
    label: "Settings",
    match: (p: string) => p.startsWith("/dashboard/family/settings"),
  },
];

type MobileNavProps = {
  pendingReviewCount?: number;
};

export function MobileNav({ pendingReviewCount = 0 }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1">
        {PRIMARY_ITEMS.map((item) => {
          const active = item.match(pathname);
          const badge =
            item.badgeKey === "review" && pendingReviewCount > 0
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
      </div>
    </nav>
  );
}
