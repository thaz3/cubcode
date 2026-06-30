import type { TaskStatus } from "@/generated/prisma/client";
import { coerceDate } from "@/lib/coerce-date";
import { getWeekStart } from "@/lib/council-day";

const ACTIVE_SCHEDULE_STATUSES: TaskStatus[] = [
  "CLAIMED",
  "IN_PROGRESS",
  "SENT_BACK",
  "SUBMITTED",
];

export type TaskScheduleInput = {
  claimedAt: Date | string | null;
  dueAt: Date | string | null;
  dueAtHasTime?: boolean;
  submittedAt?: Date | string | null;
  status: TaskStatus;
  createdAt: Date | string;
};

function normalizeTaskScheduleInput(task: TaskScheduleInput) {
  return {
    ...task,
    claimedAt: coerceDate(task.claimedAt),
    dueAt: coerceDate(task.dueAt),
    createdAt: coerceDate(task.createdAt) ?? new Date(),
  };
}

export type TaskScheduleSummary = {
  assignedAt: Date;
  dueAt: Date | null;
  /** Days until due: positive = left, 0 = due today, negative = overdue. */
  daysRemaining: number | null;
  dueLabel: string | null;
  timingLabel: string | null;
  timingTone: "overdue" | "due-today" | "left" | null;
  /** @deprecated Use timingLabel */
  daysBehind: number | null;
  /** @deprecated Use timingLabel */
  behindLabel: string | null;
};

export function parseDueDateInput(value: string | undefined | null): Date | null {
  return parseDueDateFormValue(value).dueAt;
}

export function parseDueDateFormValue(value: string | undefined | null): {
  dueAt: Date | null;
  dueAtHasTime: boolean;
} {
  if (!value?.trim()) {
    return { dueAt: null, dueAtHasTime: false };
  }

  const trimmed = value.trim();
  const datetimeMatch = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(trimmed);
  if (datetimeMatch) {
    return {
      dueAt: new Date(
        Number(datetimeMatch[1]),
        Number(datetimeMatch[2]) - 1,
        Number(datetimeMatch[3]),
        Number(datetimeMatch[4]),
        Number(datetimeMatch[5]),
      ),
      dueAtHasTime: true,
    };
  }

  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!dateMatch) {
    return { dueAt: null, dueAtHasTime: false };
  }

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  return {
    dueAt: new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999)),
    dueAtHasTime: false,
  };
}

export function formatDueDateInputValue(
  date: Date | null | undefined,
  dueAtHasTime = false,
): string {
  if (!date) {
    return "";
  }

  if (dueAtHasTime) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function dueInHoursFromNow(hours: number, now = new Date()): string {
  const due = new Date(now.getTime() + hours * 60 * 60 * 1000);
  const year = due.getFullYear();
  const month = String(due.getMonth() + 1).padStart(2, "0");
  const day = String(due.getDate()).padStart(2, "0");
  const hrs = String(due.getHours()).padStart(2, "0");
  const mins = String(due.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hrs}:${mins}`;
}

export function formatScheduleDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Format a stored due date for display. */
export function formatDueScheduleDate(date: Date, dueAtHasTime = false): string {
  if (dueAtHasTime) {
    return date.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function calendarDayStartUtc(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export function daysUntilDue(dueAt: Date, now = new Date()): number {
  const dueDay = calendarDayStartUtc(dueAt);
  const today = calendarDayStartUtc(now);
  return Math.floor((dueDay.getTime() - today.getTime()) / 86400000);
}

export function daysBehindDue(dueAt: Date, now = new Date()): number {
  const remaining = daysUntilDue(dueAt, now);
  return remaining < 0 ? Math.abs(remaining) : 0;
}

export function formatDaysOverdue(days: number): string {
  if (days === 1) {
    return "1 day overdue";
  }
  return `${days} days overdue`;
}

export function formatDaysRemaining(days: number): string {
  if (days === 1) {
    return "1 day left";
  }
  return `${days} days left`;
}

export function formatDaysBehind(days: number): string {
  return formatDaysOverdue(days);
}

export function minutesUntilDue(
  dueAt: Date,
  dueAtHasTime: boolean,
  now = new Date(),
): number {
  if (dueAtHasTime) {
    return Math.floor((dueAt.getTime() - now.getTime()) / 60000);
  }

  return Math.floor((dueAt.getTime() - now.getTime()) / 60000);
}

export function formatMinutesUntilDue(minutes: number): string {
  if (minutes < 0) {
    const overdue = Math.abs(minutes);
    if (overdue < 60) {
      return `${overdue} min overdue`;
    }
    const hours = Math.round(overdue / 60);
    return hours === 1 ? "1 hour overdue" : `${hours} hours overdue`;
  }

  if (minutes < 60) {
    return minutes <= 0 ? "Due now" : `Due in ${minutes} min`;
  }

  if (minutes < 24 * 60) {
    const hours = Math.round(minutes / 60);
    return hours === 1 ? "Due in 1 hour" : `Due in ${hours} hours`;
  }

  const days = Math.ceil(minutes / (24 * 60));
  return formatDaysRemaining(days);
}

export function isTaskOverdue(
  task: TaskScheduleInput,
  now = new Date(),
): boolean {
  const normalized = normalizeTaskScheduleInput(task);
  const actionable = ["CLAIMED", "IN_PROGRESS", "SENT_BACK"].includes(
    normalized.status,
  );
  if (!normalized.dueAt || !actionable) {
    return false;
  }

  return (
    minutesUntilDue(normalized.dueAt, normalized.dueAtHasTime ?? false, now) < 0
  );
}

export function isTaskUrgent(
  task: TaskScheduleInput,
  withinMinutes = 4 * 60,
  now = new Date(),
): boolean {
  const normalized = normalizeTaskScheduleInput(task);
  const actionable = ["CLAIMED", "IN_PROGRESS", "SENT_BACK"].includes(
    normalized.status,
  );
  if (!normalized.dueAt || !actionable) {
    return false;
  }

  const minutes = minutesUntilDue(
    normalized.dueAt,
    normalized.dueAtHasTime ?? false,
    now,
  );
  return minutes < 0 || minutes <= withinMinutes;
}

export function compareTaskUrgency(a: TaskScheduleInput, b: TaskScheduleInput): number {
  const normA = normalizeTaskScheduleInput(a);
  const normB = normalizeTaskScheduleInput(b);

  const minutesA = normA.dueAt
    ? minutesUntilDue(normA.dueAt, normA.dueAtHasTime ?? false)
    : null;
  const minutesB = normB.dueAt
    ? minutesUntilDue(normB.dueAt, normB.dueAtHasTime ?? false)
    : null;

  if (minutesA !== null && minutesB !== null) {
    return minutesA - minutesB;
  }
  if (minutesA !== null) {
    return -1;
  }
  if (minutesB !== null) {
    return 1;
  }

  const assignedA = normA.claimedAt ?? normA.createdAt;
  const assignedB = normB.claimedAt ?? normB.createdAt;
  return assignedB.getTime() - assignedA.getTime();
}

export function sortTasksByUrgency<T extends TaskScheduleInput>(tasks: T[]): T[] {
  return [...tasks].sort(compareTaskUrgency);
}

export function getTaskScheduleSummary(
  task: TaskScheduleInput,
  now = new Date(),
): TaskScheduleSummary {
  const normalized = normalizeTaskScheduleInput(task);
  const assignedAt = normalized.claimedAt ?? normalized.createdAt;
  const dueAt = normalized.dueAt;
  const dueAtHasTime = task.dueAtHasTime ?? false;
  const dueLabel = dueAt ? formatDueScheduleDate(dueAt, dueAtHasTime) : null;

  let daysRemaining: number | null = null;
  let timingLabel: string | null = null;
  let timingTone: TaskScheduleSummary["timingTone"] = null;
  let daysBehind: number | null = null;
  let behindLabel: string | null = null;

  if (dueAt && ACTIVE_SCHEDULE_STATUSES.includes(normalized.status)) {
    if (dueAtHasTime) {
      const minutes = minutesUntilDue(dueAt, true, now);
      daysRemaining = Math.floor(minutes / (24 * 60));
      timingLabel = formatMinutesUntilDue(minutes);

      if (minutes < 0) {
        daysBehind = Math.ceil(Math.abs(minutes) / (24 * 60));
        behindLabel = timingLabel;
        timingTone = "overdue";
      } else if (minutes <= 60) {
        timingTone = "due-today";
      } else if (minutes <= 4 * 60) {
        timingTone = "due-today";
      } else {
        timingTone = "left";
      }
    } else {
      const remaining = daysUntilDue(dueAt, now);
      daysRemaining = remaining;

      if (remaining < 0) {
        daysBehind = Math.abs(remaining);
        timingLabel = formatDaysOverdue(daysBehind);
        behindLabel = timingLabel;
        timingTone = "overdue";
      } else if (remaining === 0) {
        timingLabel = "Due today";
        timingTone = "due-today";
      } else {
        timingLabel = formatDaysRemaining(remaining);
        timingTone = "left";
      }
    }
  }

  return {
    assignedAt,
    dueAt,
    daysRemaining,
    dueLabel,
    timingLabel,
    timingTone,
    daysBehind,
    behindLabel,
  };
}

/** Week bucket for a task: due week if set, otherwise assignment week. */
export function getTaskWeekStart(task: TaskScheduleInput): Date {
  const normalized = normalizeTaskScheduleInput(task);
  const anchor =
    normalized.dueAt ?? normalized.claimedAt ?? normalized.createdAt;
  return getWeekStart(anchor);
}

export function taskBelongsToWeek(
  task: TaskScheduleInput,
  weekStart: Date,
): boolean {
  return getTaskWeekStart(task).getTime() === weekStart.getTime();
}

export function filterTasksForWeek<T extends TaskScheduleInput>(
  tasks: T[],
  weekStart: Date,
): T[] {
  return tasks.filter((task) => taskBelongsToWeek(task, weekStart));
}

/**
 * Cub-facing week view: active tasks for the current week plus actionable carryover.
 * Completed, rejected, and unassigned tasks are never shown.
 */
export function isTaskVisibleOnCubWeekView(
  task: TaskScheduleInput,
  weekStart: Date,
  now = new Date(),
): boolean {
  if (!ACTIVE_SCHEDULE_STATUSES.includes(task.status)) {
    return false;
  }

  if (taskBelongsToWeek(task, weekStart)) {
    return true;
  }

  if (task.status === "SUBMITTED") {
    return true;
  }

  if (isTaskOverdue(task, now)) {
    return true;
  }

  return false;
}

export function filterTasksForCubWeekView<T extends TaskScheduleInput>(
  tasks: T[],
  weekStart: Date,
  now = new Date(),
): T[] {
  return tasks.filter((task) =>
    isTaskVisibleOnCubWeekView(task, weekStart, now),
  );
}

const CUB_TODAY_TASK_STATUSES: TaskStatus[] = [
  "CLAIMED",
  "IN_PROGRESS",
  "SENT_BACK",
];

/** Cub Today view: routines plus tasks due today, overdue, or without a due date. */
export function isTaskForCubTodayView(
  task: TaskScheduleInput,
  now = new Date(),
): boolean {
  if (!CUB_TODAY_TASK_STATUSES.includes(task.status)) {
    return false;
  }

  if (!task.dueAt) {
    return true;
  }

  const summary = getTaskScheduleSummary(task, now);
  return summary.timingTone === "overdue" || summary.timingTone === "due-today";
}

export function filterTasksForCubTodayView<T extends TaskScheduleInput>(
  tasks: T[],
  now = new Date(),
): T[] {
  return tasks.filter((task) => isTaskForCubTodayView(task, now));
}
