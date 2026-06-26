import type { EarnType } from "@/lib/earn-types";

/** Shared visual tokens for the kid-facing cub experience. */
export const cubKidHeroBadge =
  "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-600 to-violet-900 text-3xl shadow-lg shadow-violet-500/25 sm:h-20 sm:w-20";

export const cubKidBackLink =
  "inline-flex min-h-10 items-center gap-1 rounded-xl border border-violet-500/20 bg-violet-950/30 px-3 py-1.5 text-sm font-bold text-violet-200 transition hover:border-violet-400/35 hover:bg-violet-950/50 hover:text-cub-gold-light";

export const cubKidSectionEyebrow =
  "text-[10px] font-bold uppercase tracking-[0.2em] text-cub-gold-light";

export const cubKidPanelViolet =
  "relative overflow-hidden rounded-3xl border-2 border-violet-500/25 bg-gradient-to-b from-cub-charcoal via-cub-ebony to-cub-deep-black shadow-xl shadow-violet-950/25";

export const cubKidPanelGold =
  "relative overflow-hidden rounded-3xl border-2 border-cub-gold/25 bg-gradient-to-b from-cub-charcoal via-cub-ebony to-cub-deep-black shadow-xl shadow-cub-gold/10";

export const cubKidPanelGlow =
  "pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_15%_0%,rgba(139,92,246,0.22),transparent_50%),radial-gradient(circle_at_85%_100%,rgba(213,160,33,0.1),transparent_45%)]";

export const cubKidStatBar =
  "flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cub-gold/20 bg-cub-charcoal/80 px-4 py-3";

export const cubKidTipCard =
  "rounded-2xl border border-violet-500/25 bg-gradient-to-r from-violet-950/50 via-cub-charcoal to-cub-ebony px-4 py-3";

export const cubKidGameCard =
  "rounded-2xl border-2 bg-gradient-to-br from-cub-charcoal/90 to-cub-ebony shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg";

export const cubKidNavActive =
  "bg-gradient-to-b from-violet-600/90 to-violet-900/90 text-cub-off-white ring-1 ring-violet-400/40 shadow-md shadow-violet-500/25";

export const cubKidNavInactive =
  "text-cub-muted hover:bg-violet-950/40 hover:text-cub-off-white";

export const EARN_TYPE_EMOJI: Record<EarnType, string> = {
  routine: "🔄",
  task: "⭐",
  growth_pick: "🌱",
  training_path: "🗺️",
  bonus: "✨",
};

export const CUB_PAGE_EMOJI: Record<string, string> = {
  today: "🐾",
  overview: "📋",
  training: "🗺️",
  routines: "🔄",
  growthPicks: "🌱",
  progress: "📈",
  rewards: "🏆",
  waysToEarn: "💎",
  level: "🎮",
};
