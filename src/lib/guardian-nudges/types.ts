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
    NOT_TOUCHED_AFTER_ASSIGN: "No action after assignment",
    NOT_STARTED_BEFORE_DUE: "Due soon and not started",
    OVERDUE_NOT_STARTED: "Overdue and not started",
    SUBMITTED_FOR_REVIEW: "Submitted for review",
    DAILY_SUMMARY: "Daily parent summary",
  };

export const GUARDIAN_NUDGE_RULE_DESCRIPTIONS: Record<
  GuardianNudgeRuleType,
  string
> = {
  NOT_TOUCHED_AFTER_ASSIGN:
    "Nudge when a task is assigned but your Cub has not taken meaningful action within your chosen time after assignment.",
  NOT_STARTED_BEFORE_DUE:
    "Nudge when a task has a due time and your Cub has not started it within your chosen window before the due time.",
  OVERDUE_NOT_STARTED:
    "Nudge when the due time has passed and your Cub has not started the task.",
  SUBMITTED_FOR_REVIEW:
    "Nudge when your Cub submits a task and it is waiting for your review.",
  DAILY_SUMMARY:
    "Optional once-a-day in-app summary on your Dashboard. You choose the time.",
};

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
  cub: { id: string; displayName: string } | null;
  focusBlocks: Array<{ id: string }>;
};
