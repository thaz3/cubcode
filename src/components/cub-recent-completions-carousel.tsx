"use client";

import { StatusBadge } from "@/components/ui/status-badge";
import type { SerializedCompletionFeedItem } from "@/lib/cub-completion-feed";
import {
  cubKidBadge,
  cubKidSectionEyebrow,
  cubKidSectionTitle,
  cubKidTextMuted,
} from "@/lib/cub-kid-theme";
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
      surface: "border-red-300 bg-red-50 shadow-lg shadow-red-200/30",
      accentBar: "bg-red-400",
      glow: "from-red-200/40 via-transparent to-transparent",
      badge: "bg-red-100 text-red-700 ring-red-300",
      badgeText: "Try again",
      subtitle: "text-red-600",
      icon: "↩",
    };
  }

  const subtitle = item.subtitle.toLowerCase();

  if (subtitle.includes("routine")) {
    return {
      surface: "border-emerald-300 bg-emerald-50 shadow-lg shadow-emerald-200/30",
      accentBar: "bg-kid-green",
      glow: "from-emerald-200/40 via-transparent to-transparent",
      badge: "bg-emerald-100 text-emerald-700 ring-emerald-300",
      badgeText: "Routine win",
      subtitle: "text-emerald-600",
      icon: "✦",
    };
  }

  if (subtitle.includes("redeem")) {
    return {
      surface: "border-kid-yellow/60 bg-kid-yellow/20 shadow-lg shadow-kid-orange/20",
      accentBar: "bg-kid-orange",
      glow: "from-kid-yellow/40 via-transparent to-transparent",
      badge: "bg-amber-100 text-amber-700 ring-amber-300",
      badgeText: "Redeemed",
      subtitle: "text-orange-600",
      icon: "★",
    };
  }

  if (subtitle.includes("family") || subtitle.includes("bonus")) {
    return {
      surface: "border-kid-pink/40 bg-pink-50 shadow-lg shadow-pink-200/25",
      accentBar: "bg-gradient-to-r from-kid-pink to-kid-purple",
      glow: "from-pink-200/40 via-transparent to-transparent",
      badge: "bg-pink-100 text-pink-700 ring-pink-300",
      badgeText: "Bonus",
      subtitle: "text-pink-600",
      icon: "★",
    };
  }

  return {
    surface: "border-kid-purple/30 bg-kid-lavender/60 shadow-lg shadow-kid-purple/15",
    accentBar: "bg-gradient-to-r from-kid-purple to-kid-blue",
    glow: "from-violet-200/40 via-transparent to-transparent",
    badge: "bg-violet-100 text-violet-700 ring-violet-300",
    badgeText: "Task win",
    subtitle: "text-violet-600",
    icon: "✦",
  };
}

function rewardPillClass(part: string): string {
  const lower = part.toLowerCase();

  if (lower.includes("xp")) {
    return "bg-emerald-100 text-emerald-700 ring-emerald-300";
  }
  if (lower.includes("token")) {
    return "bg-amber-100 text-amber-700 ring-amber-300";
  }
  if (lower.includes("phone")) {
    return "bg-sky-100 text-sky-700 ring-sky-300";
  }
  if (lower.includes("bank")) {
    return "bg-violet-100 text-violet-700 ring-violet-300";
  }

  return "bg-amber-100 text-amber-700 ring-amber-300";
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
      <p className={cn("text-sm", cubKidTextMuted)}>
        Nothing here yet. Finish tasks and routines, then get parent approval to
        see your wins roll through. 🌟
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
                <p className="mt-2 text-lg font-black leading-snug text-kid-ink sm:text-xl">
                  {activeItem.title}
                </p>
                <p className={cn("mt-1 text-sm font-medium", theme.subtitle)}>
                  {activeItem.subtitle}
                </p>
              </div>
              <span className="shrink-0 rounded-lg bg-white/80 px-2 py-1 text-xs font-bold text-kid-ink-muted ring-1 ring-kid-purple/15">
                {formatFeedDate(activeItem.occurredAt)}
              </span>
            </div>

            {activeItem.rewardsLine ? (
              <RewardPills rewardsLine={activeItem.rewardsLine} />
            ) : activeItem.status === "REJECTED" ? (
              <p className={cn("relative mt-3 text-sm", cubKidTextMuted)}>
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
                  ? "w-7 bg-gradient-to-r from-kid-purple to-kid-pink shadow-sm shadow-kid-purple/30"
                  : "w-2 bg-kid-lavender ring-1 ring-kid-purple/20 hover:bg-kid-purple/30",
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
        <p className={cubKidSectionEyebrow}>🎉 Celebrate</p>
        <h2 className={cn("mt-1 text-xl sm:text-2xl", cubKidSectionTitle)}>
          Recent wins
        </h2>
        <p className={cn("mt-1.5 text-sm", cubKidTextMuted)}>
          XP earned! Completions and rewards from approved tasks and routines.
        </p>
      </div>
      {count > 0 ? (
        <span className={cubKidBadge}>
          {count} ⭐
        </span>
      ) : null}
    </div>
  );
}
