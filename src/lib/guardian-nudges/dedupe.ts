import type { GuardianNudgeRuleType } from "@/generated/prisma/client";

function dateBucket(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function buildNotTouchedAfterAssignDedupeKey(
  taskId: string,
  claimedAt: Date,
): string {
  return `not_touched_after_assign:${taskId}:${claimedAt.toISOString()}`;
}

export function buildNotStartedDedupeKey(taskId: string, dueAt: Date): string {
  return `not_started:${taskId}:${dueAt.toISOString()}`;
}

export function buildOverdueDedupeKey(taskId: string, now = new Date()): string {
  return `overdue:${taskId}:${dateBucket(now)}`;
}

export function buildSubmittedDedupeKey(taskId: string): string {
  return `submitted:${taskId}`;
}

export function buildDailySummaryDedupeKey(now = new Date()): string {
  return `daily_summary:${dateBucket(now)}`;
}

export function buildDedupeKey(
  type: GuardianNudgeRuleType,
  options: { taskId?: string; dueAt?: Date | null; claimedAt?: Date | null; now?: Date },
): string | null {
  const now = options.now ?? new Date();

  switch (type) {
    case "NOT_TOUCHED_AFTER_ASSIGN":
      if (!options.taskId || !options.claimedAt) return null;
      return buildNotTouchedAfterAssignDedupeKey(options.taskId, options.claimedAt);
    case "NOT_STARTED_BEFORE_DUE":
      if (!options.taskId || !options.dueAt) return null;
      return buildNotStartedDedupeKey(options.taskId, options.dueAt);
    case "OVERDUE_NOT_STARTED":
      if (!options.taskId) return null;
      return buildOverdueDedupeKey(options.taskId, now);
    case "SUBMITTED_FOR_REVIEW":
      if (!options.taskId) return null;
      return buildSubmittedDedupeKey(options.taskId);
    case "DAILY_SUMMARY":
      return buildDailySummaryDedupeKey(now);
    default:
      return null;
  }
}
