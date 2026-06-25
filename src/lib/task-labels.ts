import type { TaskProofType } from "@/generated/prisma/client";
import {
  getEffectiveTaskRewards,
  OVERDUE_REWARD_PENALTY_LABEL,
  type TaskRewardContext,
} from "@/lib/task-rewards";

export const DEFAULT_CHECKLIST_ITEMS = [
  "I read the task requirements",
  "I completed the work",
  "I checked my work before submitting",
] as const;

/** Proof types allowed for new tasks (MVP privacy contract). */
export const MVP_CUB_PROOF_TYPES = [
  "PARENT_APPROVAL",
  "SHORT_REFLECTION",
  "CHECKLIST",
  "TIME_LOG",
] as const satisfies readonly TaskProofType[];

/** Legacy proof types — existing tasks only; hidden from new task flows. */
export const LEGACY_CUB_PROOF_TYPES = [
  "PERFORMANCE_VIDEO",
  "SLIDESHOW",
] as const satisfies readonly TaskProofType[];

export type MvpCubProofType = (typeof MVP_CUB_PROOF_TYPES)[number];

/** Proof types the parent can choose when assigning a task. */
export const CUB_PROOF_TYPE_LABELS: Record<TaskProofType, string> = {
  PARENT_APPROVAL: "Parent approval only",
  SHORT_REFLECTION: "Short written reflection",
  CHECKLIST: "Checklist",
  TIME_LOG: "Simple time log",
  PERFORMANCE_VIDEO: "Performance video upload",
  SLIDESHOW: "PowerPoint / slideshow",
};

export type CubProofType = keyof typeof CUB_PROOF_TYPE_LABELS;

/** Max checklist lines per task — enough for extensive multi-step work. */
export const MAX_CHECKLIST_ITEMS = 50;

export const MAX_CHECKLIST_ITEM_LENGTH = 500;

export function parseChecklistLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim().slice(0, MAX_CHECKLIST_ITEM_LENGTH))
    .filter(Boolean)
    .slice(0, MAX_CHECKLIST_ITEMS);
}

export function formatProofType(proofType: TaskProofType): string {
  const label = CUB_PROOF_TYPE_LABELS[proofType];
  if (isLegacyProofType(proofType)) {
    return `${label} (legacy)`;
  }
  return label;
}

export function isMvpProofType(
  proofType: TaskProofType,
): proofType is MvpCubProofType {
  return (MVP_CUB_PROOF_TYPES as readonly string[]).includes(proofType);
}

export function isLegacyProofType(proofType: TaskProofType): boolean {
  return (LEGACY_CUB_PROOF_TYPES as readonly string[]).includes(proofType);
}

export function selectableCubProofTypes(): readonly MvpCubProofType[] {
  return MVP_CUB_PROOF_TYPES;
}

export function checklistItemsToText(items: string[] | null | undefined): string {
  if (!items?.length) {
    return DEFAULT_CHECKLIST_ITEMS.join("\n");
  }
  return items.join("\n");
}

export function formatTaskRewards(
  task: TaskRewardContext,
  options?: { referenceTime?: Date },
): string {
  const rewards = getEffectiveTaskRewards(task, options?.referenceTime);
  const base = `${rewards.focusMinutesEarned} focus min · ${rewards.phoneMinutesEarned} phone min · ${rewards.xpEarned} XP · ${rewards.focusTokensEarned} Focus Token${rewards.focusTokensEarned === 1 ? "" : "s"}`;

  if (!rewards.penalizedForLateSubmission) {
    return base;
  }

  return `${base} (${OVERDUE_REWARD_PENALTY_LABEL})`;
}

export function normalizeCubProofType(proofType: TaskProofType): CubProofType {
  return proofType;
}

export function defaultProofPrompt(proofType: CubProofType): string {
  switch (proofType) {
    case "PARENT_APPROVAL":
      return "Describe what your Cub should do. They submit when finished — you approve to award rewards.";
    case "SHORT_REFLECTION":
      return "What did you do? What did you learn?";
    case "CHECKLIST":
      return "Complete each item before submitting.";
    case "TIME_LOG":
      return "Log how many minutes you spent on this task.";
    case "PERFORMANCE_VIDEO":
      return "Upload your video to Drive or iCloud, tap Share → Copy link, then paste it when you submit.";
    case "SLIDESHOW":
      return "Upload your slideshow to Drive or iCloud, tap Share → Copy link, then paste it when you submit.";
    default:
      return "";
  }
}
