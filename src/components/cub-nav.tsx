"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { suffix: "", label: "Today" },
  { suffix: "/tasks", label: "Tasks" },
  { suffix: "/progress", label: "Progress" },
] as const;

type CubNavProps = {
  cubId: string;
};

export function CubNav({ cubId }: CubNavProps) {
  const pathname = usePathname();
  const base = `/cub/${cubId}`;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Cub navigation"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1">
        {NAV_ITEMS.map((item) => {
          const href = `${base}${item.suffix}`;
          const active =
            item.suffix === ""
              ? pathname === base
              : pathname.startsWith(href);

          return (
            <Link
              key={item.suffix}
              href={href}
              className={cn(
                "flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center rounded-lg px-1 py-2 text-[11px] font-medium transition",
                active ? "text-amber-500" : "text-zinc-500 hover:text-zinc-300",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
