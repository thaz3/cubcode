"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CUB_NAV_ITEMS, isCubNavActive } from "@/lib/cub-nav-items";
import { cn } from "@/lib/utils";

type CubHeaderProps = {
  cubId: string;
  displayName: string;
};

export function CubHeader({ cubId, displayName }: CubHeaderProps) {
  const pathname = usePathname();
  const base = `/cub/${cubId}`;

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-500">
            Cub view
          </p>
          <p className="truncate text-lg font-bold text-zinc-50">
            {displayName}
          </p>
        </div>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Cub navigation"
        >
          {CUB_NAV_ITEMS.map((item) => {
            const href = `${base}${item.suffix}`;
            const active = isCubNavActive(pathname, base, item.suffix);

            return (
              <Link
                key={item.suffix}
                href={href}
                className={cn(
                  "inline-flex min-h-10 items-center rounded-lg px-3 py-2 text-sm font-medium transition",
                  active
                    ? "text-amber-500"
                    : "text-zinc-400 hover:text-zinc-100",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/parent/unlock?returnTo=%2Fdashboard"
          className="shrink-0"
        >
          <Button variant="secondary" size="sm">
            Parent area
          </Button>
        </Link>
      </div>
    </header>
  );
}
