"use client";

import { StatusBadge } from "@/components/ui/status-badge";
import type { SerializedCompletionFeedItem } from "@/lib/cub-completion-feed";
import { cubSectionLabel } from "@/lib/cub-theme";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";

const AUTOPLAY_MS = 4500;

type CubRecentCompletionsCarouselProps = {
  items: SerializedCompletionFeedItem[];
  className?: string;
};

type SlideTheme = {
  surface: string;
  accentBar: string;
  glow: string;
  badge: string;
  badgeText: string;
  subtitle: string;
  icon: string;
};

function formatFeedDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function slideTheme(item: SerializedCompletionFeedItem): SlideTheme {
  if (item.status === "REJECTED") {
    return {
      surface:
        "border-cub-red-alert/45 cub-card-red shadow-lg shadow-cub-red/15",
      accentBar: "bg-cub-red-alert",
      glow: "from-cub-red-alert/20 via-transparent to-transparent",
      badge: "bg-cub-red-muted text-cub-red-light ring-cub-red-alert/40",
      badgeText: "Try again",
      subtitle: "text-cub-red-light/90",
      icon: "↩",
    };
  }

  const subtitle = item.subtitle.toLowerCase();

  if (subtitle.includes("routine")) {
    return {
      surface:
        "border-cub-green-bright/50 cub-card-green shadow-lg shadow-cub-green/20",
      accentBar: "bg-cub-green-bright",
      glow: "from-cub-green-bright/25 via-cub-gold/10 to-transparent",
      badge: "bg-cub-green-muted text-cub-green-light ring-cub-green-bright/45",
      badgeText: "Routine win",
      subtitle: "text-cub-green-light",
      icon: "✦",
    };
  }

  if (subtitle.includes("redeem")) {
    return {
      surface:
        "border-cub-gold-warm/55 cub-card-gold shadow-lg shadow-cub-gold/25",
      accentBar: "bg-cub-gold-warm",
      glow: "from-cub-gold-warm/30 via-cub-gold/10 to-transparent",
      badge: "bg-cub-gold-muted text-cub-gold-warm ring-cub-gold-warm/50",
      badgeText: "Redeemed",
      subtitle: "text-cub-gold-warm",
      icon: "★",
    };
  }

  if (subtitle.includes("family") || subtitle.includes("bonus")) {
    return {
      surface:
        "border-cub-gold/50 cub-card-gold shadow-lg shadow-cub-gold/22",
      accentBar: "bg-gradient-to-r from-cub-gold to-cub-gold-warm",
      glow: "from-cub-gold-warm/28 via-cub-green-bright/10 to-transparent",
      badge: "bg-cub-gold-muted text-cub-gold-light ring-cub-gold/50",
      badgeText: "Bonus",
      subtitle: "text-cub-gold-light",
      icon: "★",
    };
  }

  return {
    surface:
      "border-cub-gold/50 cub-card-gold shadow-lg shadow-cub-gold/20",
    accentBar: "bg-gradient-to-r from-cub-gold to-cub-gold-warm",
    glow: "from-cub-gold/25 via-cub-green-bright/8 to-transparent",
    badge: "bg-cub-gold-muted text-cub-gold-light ring-cub-gold/45",
    badgeText: "Task win",
    subtitle: "text-cub-gold-light",
    icon: "✦",
  };
}

function rewardPillClass(part: string): string {
  const lower = part.toLowerCase();

  if (lower.includes("xp")) {
    return "bg-cub-green-muted/90 text-cub-green-light ring-cub-green-bright/40";
  }
  if (lower.includes("token")) {
    return "bg-cub-gold-muted text-cub-gold-warm ring-cub-gold-warm/45";
  }
  if (lower.includes("phone")) {
    return "bg-cub-gold-muted/80 text-cub-gold-light ring-cub-gold/40";
  }
  if (lower.includes("bank")) {
    return "bg-cub-charcoal text-cub-off-white ring-cub-off-white/15";
  }

  return "bg-cub-gold-muted text-cub-gold-light ring-cub-gold/40";
}

function RewardPills({ rewardsLine }: { rewardsLine: string }) {
  const parts = rewardsLine.split(" · ").filter(Boolean);

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {parts.map((part) => (
        <span
          key={part}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-bold ring-1",
            rewardPillClass(part),
          )}
        >
          {part}
        </span>
      ))}
    </div>
  );
}

export function CubRecentCompletionsCarousel({
  items,
  className,
}: CubRecentCompletionsCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isFading, setIsFading] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (items.length === 0 || isFading) return;

      const nextIndex = ((index % items.length) + items.length) % items.length;
      if (nextIndex === activeIndex) return;

      setIsFading(true);
      window.setTimeout(() => {
        setActiveIndex(nextIndex);
        setIsFading(false);
      }, 180);
    },
    [activeIndex, isFading, items.length],
  );

  const goNext = useCallback(() => {
    goTo(activeIndex + 1);
  }, [activeIndex, goTo]);

  useEffect(() => {
    setActiveIndex(0);
  }, [items]);

  useEffect(() => {
    if (items.length <= 1 || isPaused) {
      return;
    }

    const timer = window.setInterval(goNext, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [goNext, isPaused, items.length]);

  if (items.length === 0) {
    return (
      <p className="text-sm text-cub-muted">
        Nothing here yet. Finish tasks and routines, then get parent approval to
        see your wins roll through.
      </p>
    );
  }

  const activeItem = items[activeIndex]!;
  const theme = slideTheme(activeItem);

  return (
    <div
      className={cn("space-y-4", className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsPaused(false);
        }
      }}
    >
      <div className="relative overflow-hidden rounded-2xl">
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border p-5 transition-all duration-200 ease-out",
            theme.surface,
            isFading ? "translate-x-1 opacity-0" : "translate-x-0 opacity-100",
          )}
        >
          <div
            className={cn("absolute inset-0 bg-gradient-to-br opacity-80", theme.glow)}
            aria-hidden
          />
          <div
            className={cn("absolute inset-x-0 top-0 h-1.5", theme.accentBar)}
            aria-hidden
          />

          <div className="relative">
            <div className="flex items-start justify-between gap-3">
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-bold ring-1",
                  theme.badge,
                )}
                aria-hidden
              >
                {theme.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1",
                      theme.badge,
                    )}
                  >
                    {theme.badgeText}
                  </span>
                  {activeItem.status ? (
                    <StatusBadge status={activeItem.status} />
                  ) : null}
                </div>
                <p className="mt-2 text-lg font-bold leading-snug text-cub-off-white sm:text-xl">
                  {activeItem.title}
                </p>
                <p className={cn("mt-1 text-sm font-medium", theme.subtitle)}>
                  {activeItem.subtitle}
                </p>
              </div>
              <span className="shrink-0 rounded-lg bg-cub-ebony/50 px-2 py-1 text-xs font-semibold text-cub-muted ring-1 ring-cub-off-white/10">
                {formatFeedDate(activeItem.occurredAt)}
              </span>
            </div>

            {activeItem.rewardsLine ? (
              <RewardPills rewardsLine={activeItem.rewardsLine} />
            ) : activeItem.status === "REJECTED" ? (
              <p className="relative mt-3 text-sm text-cub-muted">
                Ask your parent what to try next.
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {items.length > 1 ? (
        <div className="flex items-center justify-center gap-2">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Show completion ${index + 1} of ${items.length}`}
              aria-current={index === activeIndex ? "true" : undefined}
              onClick={() => goTo(index)}
              className={cn(
                "h-2 rounded-full transition-all",
                index === activeIndex
                  ? "w-7 bg-gradient-to-r from-cub-gold to-cub-gold-warm shadow-sm shadow-cub-gold/40"
                  : "w-2 bg-cub-charcoal ring-1 ring-cub-gold/20 hover:bg-cub-gold-muted",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function RecentWinsSectionHeader({ count }: { count: number }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className={cubSectionLabel}>Celebrate</p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-cub-off-white sm:text-2xl">
          Recent wins
        </h2>
        <p className="mt-1.5 text-sm text-cub-gold-light/85">
          Completions and rewards from approved tasks and routines.
        </p>
      </div>
      {count > 0 ? (
        <span className="shrink-0 rounded-full bg-gradient-to-br from-cub-gold to-cub-gold-warm px-3 py-1.5 text-sm font-bold text-cub-ebony shadow-md shadow-cub-gold/30">
          {count}
        </span>
      ) : null}
    </div>
  );
}
