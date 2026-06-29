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
    glowClass: "shadow-kid-blue/25 hover:shadow-kid-blue/35",
    ringClass: "ring-kid-blue/30",
    indexClass: "bg-sky-100 text-sky-700 ring-sky-300",
    leftBorderClass: "border-l-kid-blue",
    actionLabel: "Check in",
  },
  task: {
    icon: "★",
    glowClass: "shadow-kid-yellow/30 hover:shadow-kid-orange/35",
    ringClass: "ring-kid-yellow/40",
    indexClass: "bg-amber-100 text-amber-700 ring-amber-300",
    leftBorderClass: "border-l-kid-orange",
    actionLabel: "Let's Go!",
  },
  growth_pick: {
    icon: "✦",
    glowClass: "shadow-kid-green/25 hover:shadow-emerald-400/30",
    ringClass: "ring-kid-green/35",
    indexClass: "bg-emerald-100 text-emerald-700 ring-emerald-300",
    leftBorderClass: "border-l-kid-green",
    actionLabel: "Pick",
  },
  training_path: {
    icon: "▶",
    glowClass: "shadow-kid-purple/25 hover:shadow-kid-purple/35",
    ringClass: "ring-kid-purple/35",
    indexClass: "bg-violet-100 text-violet-700 ring-violet-300",
    leftBorderClass: "border-l-kid-purple",
    actionLabel: "Continue",
  },
  bonus: {
    icon: "✺",
    glowClass: "shadow-kid-pink/25 hover:shadow-kid-pink/35",
    ringClass: "ring-kid-pink/35",
    indexClass: "bg-pink-100 text-pink-700 ring-pink-300",
    leftBorderClass: "border-l-kid-pink",
    actionLabel: "View",
  },
};

export function getKidMissionStatusLabel(statusLabel?: string): string {
  if (!statusLabel) return "Ready to Play";

  const normalized = statusLabel.toLowerCase();

  if (normalized.includes("due today")) return "Go time — due today!";
  if (normalized.includes("ready to pick")) return "Your choice — pick one!";
  if (normalized === "claimed") return "Locked in — start it!";
  if (normalized === "in progress") return "You're on a roll!";
  if (normalized === "submitted") return "Waiting on parent review";
  if (normalized.includes("sent back")) return "Quick fix needed";
  if (normalized.includes("lesson")) return statusLabel;
  if (normalized === "pending") return "Ready when you are";

  return statusLabel;
}

export function getQuestLogSubtitle(count: number): string {
  if (count === 0) return "Nothing due today. Nice work, Cub!";
  if (count === 1) return "1 Mission Left — you got this!";
  if (count <= 3) return `${count} missions on your board. Let's Go!`;
  return `${count} quests waiting — knock them out one at a time!`;
}
