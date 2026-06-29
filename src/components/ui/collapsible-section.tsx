"use client";

import { useEffect, useId, useState } from "react";
import { isTaskBoardHashSection } from "@/lib/task-board-sections";
import { cn } from "@/lib/utils";

type CollapsibleSectionProps = {
  title: string;
  summary?: string;
  badge?: string | number;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
};

/**
 * Button-driven accordion — avoids native <details> touch bugs on Android
 * where taps on nested controls fail or toggle the section closed.
 */
export function CollapsibleSection({
  title,
  summary,
  badge,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  children,
  className,
}: CollapsibleSectionProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;
  const panelId = useId();

  function setOpen(next: boolean) {
    if (openProp === undefined) {
      setUncontrolledOpen(next);
    }
    onOpenChange?.(next);
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-cub-off-white/10 bg-zinc-900/40",
        className,
      )}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
        className="flex min-h-11 w-full touch-manipulation cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-zinc-100">{title}</p>
            {badge != null ? (
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-400">
                {badge}
              </span>
            ) : null}
          </div>
          {summary ? (
            <p className="mt-0.5 text-xs text-zinc-500">{summary}</p>
          ) : null}
        </div>
        <span
          className={cn(
            "shrink-0 text-xs text-zinc-500 transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        >
          ▾
        </span>
      </button>
      <div
        id={panelId}
        aria-hidden={!open}
        className={cn(
          "border-t border-cub-off-white/10 px-4 py-4 transition-[max-height,opacity,padding] duration-200",
          open
            ? "visible max-h-[5000px] opacity-100"
            : "pointer-events-none max-h-0 overflow-hidden border-0 py-0 opacity-0",
        )}
      >
        {children}
      </div>
    </div>
  );
}

/** Open a collapsible when the page hash matches `sectionId` (for board nav jumps). */
export function useOpenOnHash(sectionId: string, defaultOpen = false) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    function syncFromHash() {
      const hash = window.location.hash.replace(/^#/, "");
      if (hash === sectionId) {
        setOpen(true);
        return;
      }
      // When navigating via pill nav, collapse other board sections.
      if (hash && isTaskBoardHashSection(hash)) {
        setOpen(false);
      }
    }

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [sectionId]);

  return [open, setOpen] as const;
}
