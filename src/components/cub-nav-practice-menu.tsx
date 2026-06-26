"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CubNavGroup } from "@/lib/cub-nav-items";
import {
  isCubNavChildActive,
  isCubQuestsNavActive,
} from "@/lib/cub-nav-items";
import { useCubNavLocation } from "@/components/use-cub-nav-hash";
import { cubKidNavActive, cubKidNavInactive } from "@/lib/cub-kid-theme";
import { cn } from "@/lib/utils";

type CubNavPracticeMenuProps = {
  cubId: string;
  group: CubNavGroup;
  layout: "header" | "bottom";
  menuOpen?: boolean;
  onMenuOpenChange?: (open: boolean) => void;
};

function QuestsMenuLinks({
  group,
  base,
  pathname,
  hash,
  onClose,
}: {
  group: CubNavGroup;
  base: string;
  pathname: string;
  hash: string;
  onClose: () => void;
}) {
  return (
    <ul className="space-y-1">
      {group.children.map((child) => {
        const href = `${base}${child.suffix}`;
        const childActive = isCubNavChildActive(
          pathname,
          base,
          child.suffix,
          hash,
        );

        return (
          <li key={child.suffix}>
            <Link
              href={href}
              role="menuitem"
              onClick={onClose}
              className={cn(
                "block rounded-lg px-3 py-2.5 text-sm font-semibold transition",
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
  );
}

export function CubNavPracticeMenu({
  cubId,
  group,
  layout,
  menuOpen: menuOpenProp,
  onMenuOpenChange,
}: CubNavPracticeMenuProps) {
  const { pathname, hash } = useCubNavLocation();
  const base = `/cub/${cubId}`;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = menuOpenProp ?? uncontrolledOpen;
  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = isCubQuestsNavActive(pathname, base, group, hash);

  function setOpen(next: boolean) {
    if (menuOpenProp === undefined) {
      setUncontrolledOpen(next);
    }
    onMenuOpenChange?.(next);
  }

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        !rootRef.current?.contains(target) &&
        !(target instanceof Element && target.closest("[data-cub-quests-sheet]"))
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onScroll() {
      setOpen(false);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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

  const headerMenu =
    open && !isBottom ? (
      <div
        className="absolute left-0 top-full z-50 mt-1 min-w-[11rem] rounded-xl border border-violet-500/30 bg-cub-deep-black p-2 shadow-xl shadow-violet-950/40"
        role="menu"
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
      >
        <QuestsMenuLinks
          group={group}
          base={base}
          pathname={pathname}
          hash={hash}
          onClose={() => setOpen(false)}
        />
      </div>
    ) : null;

  const bottomSheet =
    open && isBottom && typeof document !== "undefined"
      ? createPortal(
          <div data-cub-quests-sheet className="fixed inset-0 z-[120] lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/50"
              aria-label="Close Quests menu"
              onClick={() => setOpen(false)}
            />
            <div
              className="absolute inset-x-3 rounded-2xl border border-violet-500/35 bg-cub-deep-black p-3 shadow-2xl shadow-violet-950/50"
              style={{
                bottom: "calc(4.25rem + env(safe-area-inset-bottom, 0px))",
              }}
              role="menu"
            >
              <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-300">
                Quests
              </p>
              <QuestsMenuLinks
                group={group}
                base={base}
                pathname={pathname}
                hash={hash}
                onClose={() => setOpen(false)}
              />
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div
        ref={rootRef}
        className={cn("relative", isBottom && "min-w-0 flex-1")}
        onMouseEnter={isBottom ? undefined : openMenu}
        onMouseLeave={isBottom ? undefined : scheduleClose}
      >
        <button
          type="button"
          onClick={() => setOpen(!open)}
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
        {headerMenu}
      </div>
      {bottomSheet}
    </>
  );
}
