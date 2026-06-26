"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { CubNavGroup } from "@/lib/cub-nav-items";
import { isCubNavActive, isCubNavGroupActive } from "@/lib/cub-nav-items";
import { cubKidNavActive, cubKidNavInactive } from "@/lib/cub-kid-theme";
import { cn } from "@/lib/utils";

type CubNavPracticeMenuProps = {
  cubId: string;
  group: CubNavGroup;
  layout: "header" | "bottom";
};

export function CubNavPracticeMenu({
  cubId,
  group,
  layout,
}: CubNavPracticeMenuProps) {
  const pathname = usePathname();
  const base = `/cub/${cubId}`;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = isCubNavGroupActive(pathname, base, group);

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

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const isBottom = layout === "bottom";

  function openMenu() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setOpen(true);
  }

  function scheduleClose() {
    if (isBottom) return;
    closeTimerRef.current = setTimeout(() => setOpen(false), 120);
  }

  return (
    <div
      ref={rootRef}
      className={cn("relative", isBottom && "min-w-0 flex-1")}
      onMouseEnter={isBottom ? undefined : openMenu}
      onMouseLeave={isBottom ? undefined : scheduleClose}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "transition",
          isBottom
            ? "flex min-h-14 w-full flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-bold"
            : "inline-flex min-h-10 items-center rounded-xl px-3 py-2 text-sm font-bold",
          active ? cubKidNavActive : cubKidNavInactive,
        )}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {isBottom ? (
          <span className="text-base leading-none" aria-hidden>
            🎯
          </span>
        ) : null}
        {group.label}
      </button>

      {open ? (
        <div
          className={cn(
            "absolute z-50 min-w-[11rem] rounded-xl border border-violet-500/30 bg-cub-deep-black p-2 shadow-xl shadow-violet-950/40",
            isBottom
              ? "bottom-full left-1/2 mb-2 -translate-x-1/2"
              : "left-0 top-full mt-1",
          )}
          role="menu"
          onMouseEnter={isBottom ? undefined : openMenu}
          onMouseLeave={isBottom ? undefined : scheduleClose}
        >
          <ul className="space-y-1">
            {group.children.map((child) => {
              const href = `${base}${child.suffix}`;
              const childActive = isCubNavActive(pathname, base, child.suffix);

              return (
                <li key={child.suffix}>
                  <Link
                    href={href}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block rounded-lg px-3 py-2 text-sm transition",
                      childActive
                        ? "bg-cub-gold-muted text-cub-gold-light"
                        : "text-cub-off-white hover:bg-cub-charcoal",
                    )}
                  >
                    {child.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
