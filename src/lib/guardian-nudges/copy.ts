import { formatDueScheduleDate, formatScheduleDate } from "@/lib/task-schedule";

type NudgeCopyInput = {
  cubDisplayName: string;
  taskTitle: string;
  dueAt?: Date | null;
  dueAtHasTime?: boolean;
  claimedAt?: Date | null;
};

export function formatNotTouchedAfterAssignMessage(input: NudgeCopyInput): string {
  const assignedPart = input.claimedAt
    ? ` It was assigned ${formatScheduleDate(input.claimedAt)}.`
    : "";
  return `${input.cubDisplayName} has not taken action on “${input.taskTitle}” yet.${assignedPart}`;
}

export function formatNotStartedMessage(input: NudgeCopyInput): string {
  const duePart =
    input.dueAt != null
      ? ` It is due at ${formatDueScheduleDate(input.dueAt, input.dueAtHasTime ?? false)}.`
      : "";
  return `${input.cubDisplayName} has not started “${input.taskTitle}” yet.${duePart}`;
}

export function formatOverdueMessage(input: NudgeCopyInput): string {
  const duePart =
    input.dueAt != null
      ? ` It was due at ${formatDueScheduleDate(input.dueAt, input.dueAtHasTime ?? false)}.`
      : "";
  return `${input.cubDisplayName} has not started “${input.taskTitle}”.${duePart}`;
}

export function formatSubmittedMessage(input: NudgeCopyInput): string {
  return `${input.cubDisplayName} submitted “${input.taskTitle}” for your review.`;
}

export function formatDailySummaryMessage(counts: {
  notStarted: number;
  overdue: number;
  awaitingReview: number;
}): string {
  const parts: string[] = [];
  if (counts.notStarted > 0) {
    parts.push(
      `${counts.notStarted} task${counts.notStarted === 1 ? "" : "s"} not started`,
    );
  }
  if (counts.overdue > 0) {
    parts.push(
      `${counts.overdue} overdue task${counts.overdue === 1 ? "" : "s"}`,
    );
  }
  if (counts.awaitingReview > 0) {
    parts.push(
      `${counts.awaitingReview} awaiting review`,
    );
  }

  if (parts.length === 0) {
    return "Today: no tasks need your attention right now.";
  }

  return `Today: ${parts.join(", ")}.`;
}
