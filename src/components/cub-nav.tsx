"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CubNavPracticeMenu } from "@/components/cub-nav-practice-menu";
import { CubSwitcher } from "@/components/cub-switcher";
import { CUB_NAV_ITEMS, isCubNavActive } from "@/lib/cub-nav-items";
import { cubKidNavActive, cubKidNavInactive } from "@/lib/cub-kid-theme";
import { cn } from "@/lib/utils";

const NAV_EMOJI: Record<string, string> = {
  "": "🏠",
  "/tasks": "📋",
  "/progress": "📈",
  "/rewards": "🏆",
};

type CubNavProps = {
  cubId: string;
  cubs: Array<{ id: string; displayName: string }>;
  currentDisplayName: string;
};

export function CubNav({ cubId, cubs, currentDisplayName }: CubNavProps) {
  const pathname = usePathname();
  const base = `/cub/${cubId}`;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-violet-500/25 bg-cub-deep-black/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Cub navigation"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1">
        {CUB_NAV_ITEMS.map((item) => {
          if (item.type === "group") {
            return (
              <CubNavPracticeMenu
                key={item.id}
                cubId={cubId}
                group={item}
                layout="bottom"
              />
            );
          }

          const href = `${base}${item.suffix}`;
          const active = isCubNavActive(pathname, base, item.suffix);
          const emoji = NAV_EMOJI[item.suffix] ?? "";

          return (
            <Link
              key={item.suffix}
              href={href}
              className={cn(
                "flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-bold transition",
                active ? cubKidNavActive : cubKidNavInactive,
              )}
            >
              {emoji ? (
                <span className="text-base leading-none" aria-hidden>
                  {emoji}
                </span>
              ) : null}
              {item.label}
            </Link>
          );
        })}

        <CubSwitcher
          currentCubId={cubId}
          currentDisplayName={currentDisplayName}
          cubs={cubs}
          variant="nav"
        />
      </div>
    </nav>
  );
}
