"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CUB_NAV_ITEMS, isCubNavActive } from "@/lib/cub-nav-items";
import { cubNavActive, cubNavInactive } from "@/lib/cub-theme";
import { cn } from "@/lib/utils";

type CubNavProps = {
  cubId: string;
  showCubSwitcher?: boolean;
};

export function CubNav({ cubId, showCubSwitcher = false }: CubNavProps) {
  const pathname = usePathname();
  const base = `/cub/${cubId}`;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-cub-green/25 bg-cub-deep-black/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Cub navigation"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1">
        {CUB_NAV_ITEMS.map((item) => {
          const href = `${base}${item.suffix}`;
          const active = isCubNavActive(pathname, base, item.suffix);

          return (
            <Link
              key={item.suffix}
              href={href}
              className={cn(
                "flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center rounded-lg px-1 py-2 text-[11px] font-medium transition",
                active ? cubNavActive : cubNavInactive,
              )}
            >
              {item.label}
            </Link>
          );
        })}
        {showCubSwitcher ? (
          <Link
            href="/cub"
            className={cn(
              "flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center rounded-lg px-1 py-2 text-[11px] font-medium transition",
              pathname === "/cub" ? cubNavActive : cubNavInactive,
            )}
          >
            Switch
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
