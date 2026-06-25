"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type CubProgressTabsProps = {
  cubId: string;
};

const TABS = [
  { suffix: "", label: "Growth" },
  { suffix: "/growth", label: "Boards" },
] as const;

export function CubProgressTabs({ cubId }: CubProgressTabsProps) {
  const pathname = usePathname();
  const base = `/cub/${cubId}/progress`;

  return (
    <nav
      aria-label="Progress sections"
      className="flex gap-1 rounded-xl border border-cub-charcoal bg-cub-ebony/60 p-1"
    >
      {TABS.map((tab) => {
        const href = `${base}${tab.suffix}`;
        const isActive =
          tab.suffix === ""
            ? pathname === base
            : pathname.startsWith(href);

        return (
          <Link
            key={tab.suffix}
            href={href}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium transition-colors",
              isActive
                ? "bg-cub-green-muted text-cub-green-light shadow-sm"
                : "text-cub-muted hover:bg-cub-charcoal hover:text-cub-off-white",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
