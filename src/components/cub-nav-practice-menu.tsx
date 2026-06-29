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
import { usePrefersHover } from "@/components/use-prefers-hover";
import {
  cubKidMenuDropdown,
  cubKidMenuItemActive,
  cubKidMenuItemInactive,
  cubKidNavActive,
  cubKidNavInactive,
  cubKidSectionEyebrow,
} from "@/lib/cub-kid-theme";
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
                "block min-h-11 touch-manipulation rounded-xl px-3 py-2.5 text-sm transition",
                childActive ? cubKidMenuItemActive : cubKidMenuItemInactive,
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
  const prefersHover = usePrefersHover();

  function setOpen(next: boolean) {
    if (menuOpenProp === undefined) {
      setUncontrolledOpen(next);
    }
    onMenuOpenChange?.(next);
  }

  const isBottom = layout === "bottom";
  /** Hover-open only on header + mouse/trackpad — touch taps must use click. */
  const openOnHover = !isBottom && prefersHover;

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (
        !rootRef.current?.contains(target) &&
        !(target instanceof Element && target.closest("[data-cub-quests-sheet]"))
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    // Scroll-to-close only for header dropdowns — iOS fires spurious scroll
    // when the bottom sheet opens and would immediately dismiss it.
    if (!open || isBottom) return;

    function onScroll() {
      setOpen(false);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open, isBottom]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  function openMenu() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setOpen(true);
  }

  function scheduleClose() {
    if (!openOnHover) return;
    closeTimerRef.current = setTimeout(() => setOpen(false), 120);
  }

  function handleToggleClick() {
    if (openOnHover) {
      setOpen(true);
      return;
    }
    setOpen(!open);
  }

  const headerMenu =
    open && !isBottom ? (
      <div
        className={cn(
          "absolute left-0 top-full z-50 mt-1 min-w-[11rem]",
          cubKidMenuDropdown,
        )}
        role="menu"
        onMouseEnter={openOnHover ? openMenu : undefined}
        onMouseLeave={openOnHover ? scheduleClose : undefined}
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
              className="absolute inset-0 bg-kid-ink/30 backdrop-blur-sm"
              aria-label="Close Quests menu"
              onClick={() => setOpen(false)}
            />
            <div
              className={cn(
                "absolute inset-x-3 p-3",
                cubKidMenuDropdown,
              )}
              style={{
                bottom: "calc(4.25rem + env(safe-area-inset-bottom, 0px))",
              }}
              role="menu"
            >
              <p className={cn("mb-2 px-1", cubKidSectionEyebrow)}>
                🎯 Quests
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
        onMouseEnter={openOnHover ? openMenu : undefined}
        onMouseLeave={openOnHover ? scheduleClose : undefined}
      >
        <button
          type="button"
          onClick={handleToggleClick}
          className={cn(
            "touch-manipulation transition",
            isBottom
              ? "flex min-h-14 w-full flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-1.5 text-[10px] font-bold"
              : "inline-flex min-h-11 items-center rounded-2xl px-3 py-2 text-sm font-bold",
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
