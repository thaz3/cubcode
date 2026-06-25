import {
  formatDailySummaryMessage,
  formatNotStartedMessage,
  formatNotTouchedAfterAssignMessage,
  formatOverdueMessage,
  formatSubmittedMessage,
} from "@/lib/guardian-nudges/copy";
import {
  buildDailySummaryDedupeKey,
  buildDedupeKey,
} from "@/lib/guardian-nudges/dedupe";
import { isAtOrAfterLocalTime } from "@/lib/guardian-nudges/quiet-hours";
import { isTaskNotStarted } from "@/lib/guardian-nudges/touched";
import type {
  NudgeCandidate,
  TaskForNudgeEvaluation,
} from "@/lib/guardian-nudges/types";
import {
  guardianNudgePriority,
} from "@/lib/guardian-nudges/types";
import type {
  GuardianNudgePreferences,
  GuardianNudgeRule,
} from "@/generated/prisma/client";
import { isTaskOverdue } from "@/lib/task-schedule";

type EvaluateInput = {
  tasks: TaskForNudgeEvaluation[];
  rules: GuardianNudgeRule[];
  prefs: GuardianNudgePreferences | null;
  now?: Date;
};

function ruleMap(rules: GuardianNudgeRule[]) {
  return new Map(rules.map((rule) => [rule.type, rule]));
}

function taskHref(task: TaskForNudgeEvaluation): string {
  if (task.status === "SUBMITTED") {
    return `/dashboard/tasks/review/${task.id}`;
  }
  if (task.cubId) {
    return `/dashboard/tasks/${task.id}`;
  }
  return `/dashboard/tasks/${task.id}`;
}

function baseCopyInput(task: TaskForNudgeEvaluation) {
  return {
    cubDisplayName: task.cub?.displayName ?? "Your Cub",
    taskTitle: task.title,
    dueAt: task.dueAt,
    dueAtHasTime: task.dueAtHasTime,
    claimedAt: task.claimedAt,
  };
}

export function evaluateGuardianNudgeCandidates(
  input: EvaluateInput,
): NudgeCandidate[] {
  const now = input.now ?? new Date();
  const rules = ruleMap(input.rules);
  const candidates: NudgeCandidate[] = [];

  const notTouchedRule = rules.get("NOT_TOUCHED_AFTER_ASSIGN");
  const notStartedRule = rules.get("NOT_STARTED_BEFORE_DUE");
  const overdueRule = rules.get("OVERDUE_NOT_STARTED");
  const submittedRule = rules.get("SUBMITTED_FOR_REVIEW");

  for (const task of input.tasks) {
    if (!task.cub) continue;

    if (
      submittedRule?.enabled &&
      task.status === "SUBMITTED" &&
      task.submittedAt
    ) {
      const dedupeKey = buildDedupeKey("SUBMITTED_FOR_REVIEW", { taskId: task.id });
      if (dedupeKey) {
        candidates.push({
          type: "SUBMITTED_FOR_REVIEW",
          taskId: task.id,
          cubId: task.cub.id,
          cubDisplayName: task.cub.displayName,
          taskTitle: task.title,
          dedupeKey,
          message: formatSubmittedMessage(baseCopyInput(task)),
          href: taskHref(task),
        });
      }
    }

    if (!isTaskNotStarted(task)) {
      continue;
    }

    if (
      notTouchedRule?.enabled &&
      task.claimedAt
    ) {
      const offsetMinutes = notTouchedRule.offsetMinutes ?? 120;
      const triggerAt = new Date(
        task.claimedAt.getTime() + offsetMinutes * 60 * 1000,
      );
      if (now >= triggerAt) {
        const dedupeKey = buildDedupeKey("NOT_TOUCHED_AFTER_ASSIGN", {
          taskId: task.id,
          claimedAt: task.claimedAt,
        });
        if (dedupeKey) {
          candidates.push({
            type: "NOT_TOUCHED_AFTER_ASSIGN",
            taskId: task.id,
            cubId: task.cub.id,
            cubDisplayName: task.cub.displayName,
            taskTitle: task.title,
            dedupeKey,
            message: formatNotTouchedAfterAssignMessage(baseCopyInput(task)),
            href: taskHref(task),
          });
        }
      }
    }

    if (task.dueAt && overdueRule?.enabled && isTaskOverdue(task, now)) {
      const dedupeKey = buildDedupeKey("OVERDUE_NOT_STARTED", {
        taskId: task.id,
        now,
      });
      if (dedupeKey) {
        candidates.push({
          type: "OVERDUE_NOT_STARTED",
          taskId: task.id,
          cubId: task.cub.id,
          cubDisplayName: task.cub.displayName,
          taskTitle: task.title,
          dedupeKey,
          message: formatOverdueMessage(baseCopyInput(task)),
          href: taskHref(task),
        });
      }
    }

    if (task.dueAt && notStartedRule?.enabled) {
      const offsetMinutes = notStartedRule.offsetMinutes ?? 120;
      const triggerAt = new Date(task.dueAt.getTime() - offsetMinutes * 60 * 1000);
      if (now >= triggerAt && !isTaskOverdue(task, now)) {
        const dedupeKey = buildDedupeKey("NOT_STARTED_BEFORE_DUE", {
          taskId: task.id,
          dueAt: task.dueAt,
        });
        if (dedupeKey) {
          candidates.push({
            type: "NOT_STARTED_BEFORE_DUE",
            taskId: task.id,
            cubId: task.cub.id,
            cubDisplayName: task.cub.displayName,
            taskTitle: task.title,
            dedupeKey,
            message: formatNotStartedMessage(baseCopyInput(task)),
            href: taskHref(task),
          });
        }
      }
    }
  }

  if (
    input.prefs?.dailySummaryEnabled &&
    input.prefs.dailySummaryTime &&
    isAtOrAfterLocalTime(input.prefs.timezone, input.prefs.dailySummaryTime, now)
  ) {
    const notStarted = input.tasks.filter(isTaskNotStarted).length;
    const overdue = input.tasks.filter(
      (task) => isTaskNotStarted(task) && task.dueAt && isTaskOverdue(task, now),
    ).length;
    const awaitingReview = input.tasks.filter(
      (task) => task.status === "SUBMITTED",
    ).length;

    const dedupeKey = buildDailySummaryDedupeKey(now);
    candidates.push({
      type: "DAILY_SUMMARY",
      dedupeKey,
      message: formatDailySummaryMessage({
        notStarted,
        overdue,
        awaitingReview,
      }),
      href: "/dashboard",
    });
  }

  return prioritizeGuardianNudgeCandidates(candidates);
}

/** One active nudge per task — highest-priority rule wins. Daily summary is separate. */
export function prioritizeGuardianNudgeCandidates(
  candidates: NudgeCandidate[],
): NudgeCandidate[] {
  const dailySummaries = candidates.filter(
    (candidate) => candidate.type === "DAILY_SUMMARY",
  );
  const bestByTask = new Map<string, NudgeCandidate>();

  for (const candidate of candidates) {
    if (candidate.type === "DAILY_SUMMARY" || !candidate.taskId) {
      continue;
    }

    const current = bestByTask.get(candidate.taskId);
    if (
      !current ||
      guardianNudgePriority(candidate.type) <
        guardianNudgePriority(current.type)
    ) {
      bestByTask.set(candidate.taskId, candidate);
    }
  }

  return [...bestByTask.values(), ...dailySummaries];
}

export function candidateStillValid(
  candidate: NudgeCandidate,
  tasks: TaskForNudgeEvaluation[],
  now = new Date(),
): boolean {
  if (candidate.type === "DAILY_SUMMARY") {
    return true;
  }

  if (!candidate.taskId) return false;

  const task = tasks.find((t) => t.id === candidate.taskId);
  if (!task) return false;

  switch (candidate.type) {
    case "SUBMITTED_FOR_REVIEW":
      return task.status === "SUBMITTED";
    case "NOT_TOUCHED_AFTER_ASSIGN":
      return isTaskNotStarted(task) && Boolean(task.claimedAt);
    case "OVERDUE_NOT_STARTED":
      return isTaskNotStarted(task) && Boolean(task.dueAt) && isTaskOverdue(task, now);
    case "NOT_STARTED_BEFORE_DUE":
      if (!isTaskNotStarted(task) || !task.dueAt || isTaskOverdue(task, now)) {
        return false;
      }
      return true;
    default:
      return false;
  }
}
