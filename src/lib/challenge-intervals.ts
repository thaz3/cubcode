import type {
  Challenge,
  ChallengeIntervalType,
} from "@/generated/prisma/client";
import { getWeekStart } from "@/lib/council-day";

export type ChallengeIntervalWindow = {
  start: Date;
  end: Date;
  label: string;
  isActiveToday: boolean;
};

export type ChallengeIntervalConfig = {
  daysOfWeek?: number[];
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfLocalDay(date: Date): Date {
  const start = startOfLocalDay(date);
  return new Date(start.getTime() + 24 * 60 * 60 * 1000);
}

export function parseIntervalConfig(
  config: unknown,
): ChallengeIntervalConfig | null {
  if (!config || typeof config !== "object") {
    return null;
  }
  const raw = config as { daysOfWeek?: unknown };
  if (!Array.isArray(raw.daysOfWeek)) {
    return null;
  }
  const daysOfWeek = raw.daysOfWeek
    .map((d) => Number(d))
    .filter((d) => Number.isInteger(d) && d >= 0 && d <= 6);
  return daysOfWeek.length > 0 ? { daysOfWeek: [...new Set(daysOfWeek)].sort() } : null;
}

export function getCustomDaysOfWeek(challenge: Pick<Challenge, "intervalConfig">): number[] {
  return parseIntervalConfig(challenge.intervalConfig)?.daysOfWeek ?? [];
}

function isWeekday(day: number): boolean {
  return day >= 1 && day <= 5;
}

export function isIntervalActiveOnDate(
  intervalType: ChallengeIntervalType,
  intervalConfig: unknown,
  date: Date,
): boolean {
  const day = date.getDay();
  switch (intervalType) {
    case "DAILY":
      return true;
    case "WEEKDAYS":
      return isWeekday(day);
    case "WEEKLY":
      return true;
    case "CUSTOM": {
      const days = parseIntervalConfig(intervalConfig)?.daysOfWeek ?? [];
      return days.includes(day);
    }
    default:
      return false;
  }
}

export function formatChallengeInterval(
  intervalType: ChallengeIntervalType,
  intervalConfig: unknown,
): string {
  switch (intervalType) {
    case "DAILY":
      return "Every day";
    case "WEEKDAYS":
      return "Every weekday";
    case "WEEKLY":
      return "Every week";
    case "CUSTOM": {
      const days = parseIntervalConfig(intervalConfig)?.daysOfWeek ?? [];
      if (days.length === 0) return "Custom schedule";
      return days.map((d) => DAY_LABELS[d]).join(", ");
    }
    default:
      return "Routine";
  }
}

function formatIntervalDateRange(start: Date, end: Date): string {
  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate() - 1;
  if (sameDay) {
    return start.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }
  const weekEnd = new Date(end.getTime() - 1);
  return `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${weekEnd.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}

export function getCurrentInterval(
  challenge: Pick<Challenge, "intervalType" | "intervalConfig">,
  now = new Date(),
): ChallengeIntervalWindow | null {
  const activeToday = isIntervalActiveOnDate(
    challenge.intervalType,
    challenge.intervalConfig,
    now,
  );

  if (challenge.intervalType === "WEEKLY") {
    const start = getWeekStart(now);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return {
      start,
      end,
      label: formatIntervalDateRange(start, end),
      isActiveToday: activeToday,
    };
  }

  if (!activeToday) {
    return null;
  }

  const start = startOfLocalDay(now);
  const end = endOfLocalDay(now);
  return {
    start,
    end,
    label: formatIntervalDateRange(start, end),
    isActiveToday: true,
  };
}

export function parseCustomDaysFromForm(formData: FormData): number[] {
  const values = formData.getAll("customDays");
  return [...new Set(values.map((v) => Number(v)).filter((d) => d >= 0 && d <= 6))].sort();
}

export const CUSTOM_DAY_OPTIONS = DAY_LABELS.map((label, value) => ({
  value,
  label,
}));
