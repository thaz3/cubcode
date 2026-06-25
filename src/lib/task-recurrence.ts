import type { TaskRecurrence } from "@/generated/prisma/client";
import {
  formatRecurrenceSchedule,
  applyTimeToDate,
  computeFirstDueFromRecurrence,
  parseRecurrenceConfigFromFormData,
  recurrenceConfigHasTime,
  type TaskRecurrenceConfig,
} from "@/lib/task-recurrence-config";
import { getDueFieldsFromFormData } from "@/lib/due-date-fields";

export type { TaskRecurrenceConfig };
export {
  RECURRENCE_DAY_OPTIONS,
  parseRecurrenceConfigFromFormData,
  parseRecurrenceConfigValue,
  computeFirstDueFromRecurrence,
  recurrenceConfigHasTime,
} from "@/lib/task-recurrence-config";

export const TASK_RECURRENCE_OPTIONS: Array<{
  value: TaskRecurrence;
  label: string;
}> = [
  { value: "NONE", label: "One time" },
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
];

export function parseRecurrenceFromFormData(formData: FormData): TaskRecurrence {
  const value = formData.get("recurrence")?.toString();
  if (value === "DAILY" || value === "WEEKLY" || value === "MONTHLY") {
    return value;
  }
  return "NONE";
}

export function formatTaskRecurrence(
  recurrence: TaskRecurrence,
  config?: TaskRecurrenceConfig | null,
): string | null {
  if (config) {
    return formatRecurrenceSchedule(recurrence, config);
  }

  switch (recurrence) {
    case "DAILY":
      return "Repeats daily";
    case "WEEKLY":
      return "Repeats weekly";
    case "MONTHLY":
      return "Repeats monthly";
    default:
      return null;
  }
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function advanceDueDate(
  from: Date,
  recurrence: Exclude<TaskRecurrence, "NONE">,
  config?: TaskRecurrenceConfig | null,
): Date {
  switch (recurrence) {
    case "DAILY": {
      const next = new Date(from);
      next.setDate(next.getDate() + 1);
      return applyTimeToDate(next, config?.time);
    }
    case "WEEKLY": {
      const targetDay = config?.dayOfWeek ?? from.getDay();
      const next = startOfLocalDay(from);
      let daysAhead = targetDay - next.getDay();
      if (daysAhead <= 0) {
        daysAhead += 7;
      }
      next.setDate(next.getDate() + daysAhead);
      return applyTimeToDate(next, config?.time);
    }
    case "MONTHLY": {
      const dayOfMonth = config?.dayOfMonth ?? from.getDate();
      const next = new Date(from.getFullYear(), from.getMonth() + 1, 1);
      const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
      next.setDate(Math.min(dayOfMonth, lastDay));
      return applyTimeToDate(next, config?.time);
    }
  }
}

export function resolveRecurrenceScheduleFromForm(formData: FormData) {
  const recurrence = parseRecurrenceFromFormData(formData);
  const recurrenceConfig = parseRecurrenceConfigFromFormData(formData, recurrence);
  const dueFields = getDueFieldsFromFormData(formData);

  let dueAt = dueFields?.dueAt ?? null;
  let dueAtHasTime = dueFields?.dueAtHasTime ?? false;

  if (recurrence !== "NONE") {
    if (!dueAt) {
      dueAt = computeFirstDueFromRecurrence(recurrence, recurrenceConfig);
      dueAtHasTime = recurrenceConfigHasTime(recurrenceConfig);
    } else if (recurrenceConfigHasTime(recurrenceConfig) && !dueAtHasTime) {
      dueAt = applyTimeToDate(dueAt, recurrenceConfig?.time);
      dueAtHasTime = true;
    }
  }

  return {
    recurrence,
    recurrenceConfig,
    dueAt,
    dueAtHasTime,
  };
}
