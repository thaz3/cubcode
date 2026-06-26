"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CubColorBadge } from "@/components/cub-color-dot";
import { getCubSwitchHref } from "@/lib/cub-nav-items";
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

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
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
          "transition",
          isHeader
            ? "flex min-w-0 items-center gap-2 rounded-lg border border-cub-green/25 bg-cub-charcoal/60 px-3 py-2 text-left hover:border-cub-gold/30"
            : "flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center rounded-lg px-1 py-2 text-[11px] font-medium text-cub-muted hover:text-cub-off-white",
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {isHeader ? (
          <>
            <CubColorBadge cubId={currentCubId} displayName={currentDisplayName} />
            <span className="text-xs text-cub-gold-light">Change</span>
          </>
        ) : (
          <span className="truncate">Change</span>
        )}
      </button>

      {open ? (
        <div
          className={cn(
            "absolute z-50 min-w-[12rem] rounded-xl border border-cub-green/25 bg-cub-deep-black p-2 shadow-xl",
            isHeader ? "right-0 top-full mt-2" : "bottom-full left-1/2 mb-2 -translate-x-1/2",
          )}
          role="listbox"
          aria-label="Change Cub"
        >
          <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-cub-muted">
            Who&apos;s using this device?
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
                      "flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition",
                      isCurrent
                        ? "bg-cub-gold-muted text-cub-gold-light"
                        : "text-cub-off-white hover:bg-cub-charcoal",
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
            className="mt-1 block rounded-lg px-2 py-2 text-center text-xs font-medium text-cub-gold hover:text-cub-gold-light"
          >
            All profiles
          </Link>
        </div>
      ) : null}
    </div>
  );
}
