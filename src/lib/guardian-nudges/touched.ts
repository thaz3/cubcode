import type { TaskForNudgeEvaluation } from "@/lib/guardian-nudges/types";

const TOUCHED_STATUSES = new Set([
  "IN_PROGRESS",
  "SUBMITTED",
  "APPROVED",
  "COMPLETED",
]);

function hasChecklistProgress(checklistData: unknown): boolean {
  if (!checklistData || typeof checklistData !== "object") {
    return false;
  }
  return Object.values(checklistData as Record<string, boolean>).some(Boolean);
}

/**
 * True when the Cub has taken meaningful action beyond parent assignment.
 * `CLAIMED` alone does not count — parent assignment is not Cub progress.
 */
export function isTaskTouchedByCub(task: TaskForNudgeEvaluation): boolean {
  if (TOUCHED_STATUSES.has(task.status)) {
    return true;
  }

  if (task.startedAt || task.focusSessionStartedAt) {
    return true;
  }

  if (task.focusBlocks.length > 0) {
    return true;
  }

  if (hasChecklistProgress(task.checklistData)) {
    return true;
  }

  if (task.reflection?.trim() || task.proofLink?.trim()) {
    return true;
  }

  return false;
}

export function isTaskNotStarted(task: TaskForNudgeEvaluation): boolean {
  if (!task.cubId) {
    return false;
  }

  const actionable = ["CLAIMED", "SENT_BACK"].includes(task.status);
  if (!actionable) {
    return false;
  }

  return !isTaskTouchedByCub(task);
}
