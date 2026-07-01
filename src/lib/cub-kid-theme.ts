import type { EarnType } from "@/lib/earn-types";
import type { GrowthCategory } from "@/generated/prisma/client";

/** Shared visual tokens for the bright kid-facing cub experience. */

/* ── Typography & text ── */
export const cubKidText = "text-kid-ink";
export const cubKidTextMuted = "text-kid-ink-muted";
export const cubKidTextSoft = "text-kid-ink-soft";

export const cubKidSectionEyebrow =
  "text-[10px] font-black uppercase tracking-[0.2em] text-kid-purple";

export const cubKidSectionTitle = "font-black text-kid-ink";

/* ── Hero & navigation ── */
export const cubKidHeroBadge =
  "flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border-[3px] border-white bg-gradient-to-br from-kid-purple to-kid-pink text-3xl shadow-lg shadow-kid-purple/30 sm:h-20 sm:w-20";

export const cubKidBackLink =
  "inline-flex min-h-10 items-center gap-1 rounded-2xl border-2 border-kid-purple/25 bg-white/80 px-3 py-1.5 text-sm font-bold text-kid-purple shadow-sm transition hover:border-kid-purple/40 hover:bg-white hover:shadow-md";

export const cubKidHeader =
  "sticky top-0 z-40 border-b-[3px] border-kid-purple/20 bg-white/85 backdrop-blur-md shadow-sm shadow-kid-purple/10";

export const cubKidNavBar =
  "fixed inset-x-0 bottom-0 z-50 overflow-visible border-t-[3px] border-kid-purple/20 bg-white/92 backdrop-blur-md shadow-[0_-4px_24px_rgba(123,92,255,0.12)] lg:hidden";

export const cubKidNavActive =
  "bg-gradient-to-b from-kid-purple to-[#6a4de6] text-white shadow-md shadow-kid-purple/35 ring-2 ring-white/60";

export const cubKidNavInactive =
  "text-kid-ink-muted hover:bg-kid-lavender/80 hover:text-kid-purple";

/* ── Panels & cards ── */
export const cubKidPanelBase =
  "relative overflow-hidden rounded-3xl border-[3px] bg-white shadow-[var(--kid-shadow-card)]";

export const cubKidPanelViolet =
  `${cubKidPanelBase} border-kid-purple/30 bg-[var(--kid-gradient-purple)]`;

export const cubKidPanelGold =
  `${cubKidPanelBase} border-kid-yellow/50 bg-[var(--kid-gradient-gold)]`;

export const cubKidPanelSky =
  `${cubKidPanelBase} border-kid-blue/35 bg-[var(--kid-gradient-sky)]`;

export const cubKidPanelGreen =
  `${cubKidPanelBase} border-kid-green/40 bg-[var(--kid-gradient-green)]`;

export const cubKidPanelPink =
  `${cubKidPanelBase} border-kid-pink/35 bg-[var(--kid-gradient-pink)]`;

export const cubKidPanelGlow =
  "pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_10%_0%,rgba(123,92,255,0.12),transparent_45%),radial-gradient(circle_at_90%_100%,rgba(50,184,255,0.1),transparent_40%)]";

export const cubKidStatBar =
  "flex flex-wrap items-center justify-between gap-3 rounded-3xl border-[3px] border-kid-purple/20 bg-white px-4 py-3 shadow-[var(--kid-shadow-card)]";

export const cubKidTipCard =
  "rounded-2xl border-2 border-kid-aqua/40 bg-gradient-to-r from-kid-sky/80 to-white px-4 py-3 shadow-sm";

export const cubKidGameCard =
  "rounded-2xl border-[3px] bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:scale-[0.98]";

export const cubKidBadge =
  "inline-flex items-center gap-1 rounded-full border-2 border-kid-yellow/60 bg-kid-yellow/30 px-2.5 py-0.5 text-xs font-black text-kid-ink-soft";

export const cubKidPill =
  "inline-flex items-center rounded-full bg-kid-lavender px-3 py-1 text-xs font-bold text-kid-purple";

export const cubKidButtonPrimary =
  "rounded-2xl bg-gradient-to-b from-kid-purple to-[#6a4de6] px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-kid-purple/30 ring-2 ring-white/50 transition hover:brightness-110 active:scale-[0.98]";

export const cubKidButtonGold =
  "rounded-2xl bg-gradient-to-b from-kid-yellow to-kid-orange px-5 py-3 text-sm font-black uppercase tracking-wide text-kid-ink shadow-lg shadow-kid-orange/25 ring-2 ring-white/50 transition hover:brightness-105 active:scale-[0.98]";

export const cubKidEmptyState =
  "rounded-2xl border-2 border-dashed border-kid-purple/25 bg-kid-lavender/50 px-4 py-6 text-center";

export const cubKidStatCard =
  "relative overflow-hidden rounded-2xl border-2 border-kid-purple/15 bg-white p-4 shadow-sm";

export const cubKidMenuDropdown =
  "rounded-2xl border-2 border-kid-purple/20 bg-white p-2 shadow-xl shadow-kid-purple/15";

export const cubKidMenuItemActive =
  "bg-kid-lavender text-kid-purple font-bold";

export const cubKidMenuItemInactive =
  "text-kid-ink hover:bg-kid-lavender/60 font-semibold";

/* ── Growth area kid colors ── */
export const KID_GROWTH_COLORS: Record<GrowthCategory, string> = {
  MIND: "#7b5cff",
  BODY: "#32b8ff",
  CHARACTER: "#7dff72",
  RESPONSIBILITY: "#ff9f43",
  CREATIVITY: "#ff5fd2",
  FAMILY: "#f2c14e",
  COMMUNITY: "#44f0d3",
};

export const KID_GROWTH_TEXT: Record<GrowthCategory, string> = {
  MIND: "text-violet-600",
  BODY: "text-sky-600",
  CHARACTER: "text-emerald-600",
  RESPONSIBILITY: "text-orange-600",
  CREATIVITY: "text-pink-600",
  FAMILY: "text-amber-600",
  COMMUNITY: "text-teal-600",
};

export const KID_GROWTH_BG: Record<GrowthCategory, string> = {
  MIND: "bg-violet-50 border-violet-200",
  BODY: "bg-sky-50 border-sky-200",
  CHARACTER: "bg-emerald-50 border-emerald-200",
  RESPONSIBILITY: "bg-orange-50 border-orange-200",
  CREATIVITY: "bg-pink-50 border-pink-200",
  FAMILY: "bg-amber-50 border-amber-200",
  COMMUNITY: "bg-teal-50 border-teal-200",
};

/* ── Earn type kid card accents ── */
export const KID_EARN_CARD: Record<
  EarnType,
  { border: string; accent: string; badge: string }
> = {
  routine: {
    border: "border-kid-blue/40",
    accent: "from-kid-sky/60 to-white",
    badge: "bg-sky-100 text-sky-700 ring-sky-300",
  },
  task: {
    border: "border-kid-yellow/50",
    accent: "from-kid-yellow/40 to-white",
    badge: "bg-amber-100 text-amber-700 ring-amber-300",
  },
  growth_pick: {
    border: "border-kid-green/45",
    accent: "from-emerald-50 to-white",
    badge: "bg-emerald-100 text-emerald-700 ring-emerald-300",
  },
  training_path: {
    border: "border-kid-purple/40",
    accent: "from-kid-lavender/80 to-white",
    badge: "bg-violet-100 text-violet-700 ring-violet-300",
  },
  bonus: {
    border: "border-kid-pink/40",
    accent: "from-pink-50 to-white",
    badge: "bg-pink-100 text-pink-700 ring-pink-300",
  },
};

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
  assignments: "🎯",
  growthPicks: "🌱",
  progress: "📈",
  rewards: "🏆",
  waysToEarn: "💎",
  level: "🎮",
};

export type CubKidPanelVariant = "violet" | "gold" | "sky" | "green" | "pink";

export function cubKidPanelClass(variant: CubKidPanelVariant = "violet"): string {
  switch (variant) {
    case "gold":
      return cubKidPanelGold;
    case "sky":
      return cubKidPanelSky;
    case "green":
      return cubKidPanelGreen;
    case "pink":
      return cubKidPanelPink;
    default:
      return cubKidPanelViolet;
  }
}
