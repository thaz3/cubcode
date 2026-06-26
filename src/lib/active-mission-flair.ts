import type { EarnType } from "@/lib/earn-types";

export type MissionFlair = {
  icon: string;
  glowClass: string;
  ringClass: string;
  indexClass: string;
  leftBorderClass: string;
  actionLabel: string;
};

export const MISSION_FLAIR: Record<EarnType, MissionFlair> = {
  routine: {
    icon: "↻",
    glowClass: "shadow-sky-500/25 hover:shadow-sky-400/30",
    ringClass: "ring-sky-400/30",
    indexClass: "bg-sky-500/20 text-sky-200 ring-sky-400/40",
    leftBorderClass: "border-l-sky-500/70",
    actionLabel: "Check in",
  },
  task: {
    icon: "★",
    glowClass: "shadow-cub-gold/25 hover:shadow-cub-gold/35",
    ringClass: "ring-cub-gold/35",
    indexClass: "bg-cub-gold-muted text-cub-gold-light ring-cub-gold/40",
    leftBorderClass: "border-l-cub-gold/70",
    actionLabel: "Go",
  },
  growth_pick: {
    icon: "✦",
    glowClass: "shadow-cub-green/25 hover:shadow-cub-green-bright/30",
    ringClass: "ring-cub-green-bright/35",
    indexClass: "bg-cub-green-muted text-cub-green-light ring-cub-green-bright/40",
    leftBorderClass: "border-l-cub-green-bright/70",
    actionLabel: "Pick",
  },
  training_path: {
    icon: "▶",
    glowClass: "shadow-violet-500/25 hover:shadow-violet-400/30",
    ringClass: "ring-violet-400/35",
    indexClass: "bg-violet-950/80 text-violet-200 ring-violet-400/40",
    leftBorderClass: "border-l-violet-500/70",
    actionLabel: "Continue",
  },
  bonus: {
    icon: "✺",
    glowClass: "shadow-amber-500/20 hover:shadow-amber-400/25",
    ringClass: "ring-amber-400/35",
    indexClass: "bg-amber-950/80 text-amber-200 ring-amber-400/40",
    leftBorderClass: "border-l-amber-500/70",
    actionLabel: "View",
  },
};

export function getKidMissionStatusLabel(statusLabel?: string): string {
  if (!statusLabel) return "Ready when you are";

  const normalized = statusLabel.toLowerCase();

  if (normalized.includes("due today")) return "Go time — due today";
  if (normalized.includes("ready to pick")) return "Your choice — pick one";
  if (normalized === "claimed") return "Locked in — start it";
  if (normalized === "in progress") return "In the zone";
  if (normalized === "submitted") return "Waiting on parent review";
  if (normalized.includes("sent back")) return "Quick fix needed";
  if (normalized.includes("lesson")) return statusLabel;
  if (normalized === "pending") return "Waiting for you";

  return statusLabel;
}

export function getQuestLogSubtitle(count: number): string {
  if (count === 0) return "You cleared the board — nice work.";
  if (count === 1) return "One quest left. You got this.";
  if (count <= 3) return `${count} quests on your board. Pick one and go.`;
  return `${count} quests waiting — knock them out one at a time.`;
}
