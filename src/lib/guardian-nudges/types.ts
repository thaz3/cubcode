import type { GuardianNudgeRuleType, TaskStatus } from "@/generated/prisma/client";

export const DEFAULT_GUARDIAN_NUDGE_RULES: Array<{
  type: GuardianNudgeRuleType;
  enabled: boolean;
  offsetMinutes: number | null;
}> = [
  { type: "NOT_TOUCHED_AFTER_ASSIGN", enabled: true, offsetMinutes: 120 },
  { type: "NOT_STARTED_BEFORE_DUE", enabled: true, offsetMinutes: 120 },
  { type: "OVERDUE_NOT_STARTED", enabled: true, offsetMinutes: null },
  { type: "SUBMITTED_FOR_REVIEW", enabled: true, offsetMinutes: null },
  { type: "DAILY_SUMMARY", enabled: false, offsetMinutes: null },
];

export const GUARDIAN_NUDGE_RULE_LABELS: Record<GuardianNudgeRuleType, string> =
  {
    NOT_TOUCHED_AFTER_ASSIGN: "No progress after assigning",
    NOT_STARTED_BEFORE_DUE: "Due soon and not started",
    OVERDUE_NOT_STARTED: "Past due and not started",
    SUBMITTED_FOR_REVIEW: "Ready for your review",
    DAILY_SUMMARY: "Morning snapshot on Dashboard",
  };

export const GUARDIAN_NUDGE_RULE_DESCRIPTIONS: Record<
  GuardianNudgeRuleType,
  string
> = {
  NOT_TOUCHED_AFTER_ASSIGN:
    "You assigned a task and your child hasn't started working on it yet.",
  NOT_STARTED_BEFORE_DUE:
    "A due date is coming up and your child hasn't started yet.",
  OVERDUE_NOT_STARTED:
    "A due date has passed and your child still hasn't started.",
  SUBMITTED_FOR_REVIEW:
    "Your child turned something in and it's waiting for you to review.",
  DAILY_SUMMARY:
    "One quick summary when you open the Dashboard each day.",
};

/** Parent-friendly order on the settings screen (most urgent first). */
export const GUARDIAN_NUDGE_SETTINGS_ORDER: GuardianNudgeRuleType[] = [
  "SUBMITTED_FOR_REVIEW",
  "OVERDUE_NOT_STARTED",
  "NOT_STARTED_BEFORE_DUE",
  "NOT_TOUCHED_AFTER_ASSIGN",
];

/** Highest-priority task nudge wins when multiple rules apply at once. */
export const GUARDIAN_NUDGE_TASK_PRIORITY: GuardianNudgeRuleType[] = [
  "SUBMITTED_FOR_REVIEW",
  "OVERDUE_NOT_STARTED",
  "NOT_STARTED_BEFORE_DUE",
  "NOT_TOUCHED_AFTER_ASSIGN",
];

export function guardianNudgePriority(type: GuardianNudgeRuleType): number {
  const index = GUARDIAN_NUDGE_TASK_PRIORITY.indexOf(type);
  return index === -1 ? 100 : index;
}

export type NudgeCandidate = {
  type: GuardianNudgeRuleType;
  taskId?: string;
  cubId?: string;
  cubDisplayName?: string;
  taskTitle?: string;
  dueLabel?: string | null;
  dedupeKey: string;
  message: string;
  href: string;
};

export type TaskForNudgeEvaluation = {
  id: string;
  title: string;
  status: TaskStatus;
  dueAt: Date | null;
  dueAtHasTime: boolean;
  claimedAt: Date | null;
  createdAt: Date;
  startedAt: Date | null;
  focusSessionStartedAt: Date | null;
  reflection: string | null;
  proofLink: string | null;
  checklistData: unknown;
  submittedAt: Date | null;
  cubId: string | null;
  isUrgent: boolean;
  cub: { id: string; displayName: string } | null;
  focusBlocks: Array<{ id: string }>;
};
