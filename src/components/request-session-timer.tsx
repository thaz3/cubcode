"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type RequestSessionTimerProps = {
  startedAt: string;
  label?: string;
  large?: boolean;
  className?: string;
};

function formatElapsed(elapsedMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

const TIMER_PLACEHOLDER = "0:00";

export function RequestSessionTimer({
  startedAt,
  label = "Request timer",
  large = false,
  className,
}: RequestSessionTimerProps) {
  const startedMs = new Date(startedAt).getTime();
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setElapsedMs(Date.now() - startedMs);
    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [startedMs]);

  const display =
    elapsedMs === null ? TIMER_PLACEHOLDER : formatElapsed(elapsedMs);

  return (
    <div
      className={cn(
        "inline-flex flex-col",
        large ? "items-center text-center" : "items-start",
        className,
      )}
      role="timer"
      aria-live="polite"
      aria-label={`${label}: ${display} elapsed`}
    >
      <span
        className={cn(
          "font-medium text-cub-green dark:text-cub-green-light",
          large ? "text-sm uppercase tracking-wide" : "text-xs",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "font-mono font-semibold tabular-nums text-cub-green dark:text-cub-off-white",
          large ? "text-4xl leading-none" : "text-lg",
        )}
      >
        {display}
      </span>
    </div>
  );
}
