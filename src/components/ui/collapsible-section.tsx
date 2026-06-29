"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

type CollapsibleSectionProps = {
  title: string;
  summary?: string;
  defaultOpen?: boolean;
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
  defaultOpen = false,
  children,
  className,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

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
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-11 w-full touch-manipulation cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-100">{title}</p>
          {summary ? (
            <p className="mt-0.5 truncate text-xs text-zinc-500">{summary}</p>
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
