"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CubColorBadge } from "@/components/cub-color-dot";
import { getCubSwitchHref } from "@/lib/cub-nav-items";
import {
  cubKidMenuDropdown,
  cubKidMenuItemActive,
  cubKidMenuItemInactive,
  cubKidNavInactive,
} from "@/lib/cub-kid-theme";
import { cn } from "@/lib/utils";

type CubSummary = {
  id: string;
  displayName: string;
};

type CubSwitcherProps = {
  currentCubId: string;
  currentDisplayName: string;
  cubs: CubSummary[];
  variant?: "header" | "nav";
};

export function CubSwitcher({
  currentCubId,
  currentDisplayName,
  cubs,
  variant = "header",
}: CubSwitcherProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  if (cubs.length <= 1) {
    return null;
  }

  const isHeader = variant === "header";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "touch-manipulation transition",
          isHeader
            ? "flex min-h-11 min-w-0 items-center gap-2 rounded-xl border-2 border-kid-aqua/40 bg-kid-sky/50 px-3 py-2 text-left active:border-kid-blue/50 active:bg-kid-sky/80"
            : cn(
                "flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center rounded-2xl px-1 py-2 text-[10px] font-bold",
                cubKidNavInactive,
              ),
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {isHeader ? (
          <>
            <CubColorBadge cubId={currentCubId} displayName={currentDisplayName} />
            <span className="text-xs font-bold text-kid-purple">Change</span>
          </>
        ) : (
          <>
            <span className="text-base leading-none" aria-hidden>
              👤
            </span>
            <span className="truncate">Change</span>
          </>
        )}
      </button>

      {open ? (
        <div
          className={cn(
            "absolute z-50 min-w-[12rem] p-2",
            cubKidMenuDropdown,
            isHeader ? "right-0 top-full mt-2" : "bottom-full left-1/2 mb-2 -translate-x-1/2",
          )}
          role="listbox"
          aria-label="Change Cub"
        >
          <p className="px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-kid-ink-muted">
            Who&apos;s playing?
          </p>
          <ul className="space-y-1">
            {cubs.map((cub) => {
              const href = getCubSwitchHref(cub.id, currentCubId, pathname);
              const isCurrent = cub.id === currentCubId;

              return (
                <li key={cub.id}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex min-h-11 touch-manipulation items-center gap-2 rounded-xl px-2 py-2 text-sm transition",
                      isCurrent ? cubKidMenuItemActive : cubKidMenuItemInactive,
                    )}
                    aria-current={isCurrent ? "true" : undefined}
                  >
                    <CubColorBadge cubId={cub.id} displayName={cub.displayName} />
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href="/cub"
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-xl px-2 py-2 text-center text-xs font-bold text-kid-purple hover:bg-kid-lavender/60"
          >
            All profiles
          </Link>
        </div>
      ) : null}
    </div>
  );
}
