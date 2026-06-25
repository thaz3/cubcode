import type { TaskRecurrence } from "@/generated/prisma/client";

export type TaskRecurrenceConfig = {
  dayOfWeek?: number;
  dayOfMonth?: number;
  time?: string;
};

export const RECURRENCE_DAY_OPTIONS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
] as const;

export function parseRecurrenceConfigValue(
  value: unknown,
): TaskRecurrenceConfig | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const raw = value as Record<string, unknown>;
  const config: TaskRecurrenceConfig = {};

  if (typeof raw.time === "string" && /^\d{2}:\d{2}$/.test(raw.time)) {
    config.time = raw.time;
  }

  if (typeof raw.dayOfWeek === "number" && raw.dayOfWeek >= 0 && raw.dayOfWeek <= 6) {
    config.dayOfWeek = raw.dayOfWeek;
  }

  if (
    typeof raw.dayOfMonth === "number" &&
    raw.dayOfMonth >= 1 &&
    raw.dayOfMonth <= 31
  ) {
    config.dayOfMonth = raw.dayOfMonth;
  }

  return Object.keys(config).length > 0 ? config : null;
}

export function parseRecurrenceConfigFromFormData(
  formData: FormData,
  recurrence: TaskRecurrence,
): TaskRecurrenceConfig | null {
  if (recurrence === "NONE") {
    return null;
  }

  const time = formData.get("recurrenceTime")?.toString().trim();
  const dayOfWeekRaw = formData.get("recurrenceDayOfWeek")?.toString();
  const dayOfMonthRaw = formData.get("recurrenceDayOfMonth")?.toString();

  const config: TaskRecurrenceConfig = {};

  if (time && /^\d{2}:\d{2}$/.test(time)) {
    config.time = time;
  }

  if (dayOfWeekRaw != null && dayOfWeekRaw !== "") {
    const dayOfWeek = Number(dayOfWeekRaw);
    if (dayOfWeek >= 0 && dayOfWeek <= 6) {
      config.dayOfWeek = dayOfWeek;
    }
  }

  if (dayOfMonthRaw != null && dayOfMonthRaw !== "") {
    const dayOfMonth = Number(dayOfMonthRaw);
    if (dayOfMonth >= 1 && dayOfMonth <= 31) {
      config.dayOfMonth = dayOfMonth;
    }
  }

  return Object.keys(config).length > 0 ? config : null;
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function applyTimeToDate(date: Date, time?: string): Date {
  if (!time) {
    return date;
  }

  const [hours, minutes] = time.split(":").map(Number);
  const next = new Date(date);
  next.setHours(hours, minutes, 0, 0);
  return next;
}

export function computeFirstDueFromRecurrence(
  recurrence: Exclude<TaskRecurrence, "NONE">,
  config: TaskRecurrenceConfig | null,
  from = new Date(),
): Date {
  const anchor = new Date(from);

  switch (recurrence) {
    case "DAILY": {
      const next = applyTimeToDate(anchor, config?.time);
      if (config?.time && next.getTime() <= anchor.getTime()) {
        next.setDate(next.getDate() + 1);
      }
      return next;
    }
    case "WEEKLY": {
      const targetDay = config?.dayOfWeek ?? anchor.getDay();
      const next = startOfLocalDay(anchor);
      let daysAhead = targetDay - next.getDay();
      if (daysAhead < 0 || (daysAhead === 0 && config?.time)) {
        const withTime = applyTimeToDate(next, config?.time);
        if (daysAhead === 0 && withTime.getTime() > anchor.getTime()) {
          return withTime;
        }
        daysAhead += 7;
      }
      next.setDate(next.getDate() + daysAhead);
      return applyTimeToDate(next, config?.time);
    }
    case "MONTHLY": {
      const dayOfMonth = config?.dayOfMonth ?? anchor.getDate();
      const next = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
      const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
      next.setDate(Math.min(dayOfMonth, lastDay));
      let candidate = applyTimeToDate(next, config?.time);
      if (candidate.getTime() <= anchor.getTime()) {
        const following = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1);
        const followingLast = new Date(
          following.getFullYear(),
          following.getMonth() + 1,
          0,
        ).getDate();
        following.setDate(Math.min(dayOfMonth, followingLast));
        candidate = applyTimeToDate(following, config?.time);
      }
      return candidate;
    }
  }
}

export function formatRecurrenceSchedule(
  recurrence: TaskRecurrence,
  config: TaskRecurrenceConfig | null,
): string | null {
  if (recurrence === "NONE") {
    return null;
  }

  const timeLabel = config?.time
    ? ` at ${formatTimeLabel(config.time)}`
    : "";

  switch (recurrence) {
    case "DAILY":
      return `Repeats daily${timeLabel}`;
    case "WEEKLY": {
      const day =
        config?.dayOfWeek != null
          ? RECURRENCE_DAY_OPTIONS.find((option) => option.value === config.dayOfWeek)
              ?.label ?? "weekday"
          : "week";
      return `Repeats every ${day}${timeLabel}`;
    }
    case "MONTHLY": {
      const dom = config?.dayOfMonth;
      return dom
        ? `Repeats monthly on day ${dom}${timeLabel}`
        : `Repeats monthly${timeLabel}`;
    }
    default:
      return null;
  }
}

function formatTimeLabel(time: string): string {
  const [hoursRaw, minutesRaw] = time.split(":");
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: minutes === 0 ? undefined : "2-digit",
  });
}

export function recurrenceConfigHasTime(config: TaskRecurrenceConfig | null): boolean {
  return Boolean(config?.time);
}
