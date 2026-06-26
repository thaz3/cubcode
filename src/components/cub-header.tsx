"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CubNavPracticeMenu } from "@/components/cub-nav-practice-menu";
import { CubSwitcher } from "@/components/cub-switcher";
import { Button } from "@/components/ui/button";
import { useCubNavLocation } from "@/components/use-cub-nav-hash";
import {
  CUB_NAV_ITEMS,
  isCubNavActive,
} from "@/lib/cub-nav-items";
import { cubKidNavActive, cubKidNavInactive } from "@/lib/cub-kid-theme";
import { cn } from "@/lib/utils";

type CubHeaderProps = {
  cubId: string;
  displayName: string;
  focusTokens: number;
  cubs: Array<{ id: string; displayName: string }>;
};

export function CubHeader({ cubId, displayName, focusTokens, cubs }: CubHeaderProps) {
  const { pathname, hash } = useCubNavLocation();
  const base = `/cub/${cubId}`;
  const [questsMenuOpen, setQuestsMenuOpen] = useState(false);

  useEffect(() => {
    setQuestsMenuOpen(false);
  }, [pathname, hash]);

  return (
    <header className="sticky top-0 z-40 border-b border-violet-500/20 bg-cub-deep-black/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-700 to-violet-950 text-lg shadow-md shadow-violet-500/20"
            aria-hidden
          >
            🐾
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-violet-300">
              C.U.B. Quest
            </p>
            <p className="truncate text-lg font-black text-cub-off-white">
              {displayName}
            </p>
          </div>
          <CubSwitcher
            currentCubId={cubId}
            currentDisplayName={displayName}
            cubs={cubs}
            variant="header"
          />
        </div>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Cub navigation"
        >
          {CUB_NAV_ITEMS.map((item) => {
            if (item.type === "group") {
              return (
                <CubNavPracticeMenu
                  key={item.id}
                  cubId={cubId}
                  group={item}
                  layout="header"
                  menuOpen={questsMenuOpen}
                  onMenuOpenChange={setQuestsMenuOpen}
                />
              );
            }

            const href = `${base}${item.suffix}`;
            const active = isCubNavActive(pathname, base, item.suffix);

            return (
              <Link
                key={item.suffix}
                href={href}
                className={cn(
                  "inline-flex min-h-10 items-center rounded-xl px-3 py-2 text-sm font-bold transition",
                  active ? cubKidNavActive : cubKidNavInactive,
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`${base}/rewards`}
            className="flex items-center gap-1.5 rounded-xl border border-cub-gold/30 bg-cub-gold-muted/25 px-2.5 py-1 transition hover:border-cub-gold/45"
            title="Focus Tokens — save up for rewards"
          >
            <span className="text-sm" aria-hidden>
              🪙
            </span>
            <span className="text-sm font-black text-cub-off-white">{focusTokens}</span>
          </Link>
          <Link
            href="/parent/unlock?returnTo=%2Fdashboard"
            className="shrink-0"
          >
            <Button variant="neutral" size="sm">
              Parent area
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
