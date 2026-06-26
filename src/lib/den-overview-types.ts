import type { CalendarEventType } from "@/generated/prisma/client";
import type { CubWeekEarnSummary } from "@/lib/cub-week-earn-summary";
import type { EarnType } from "@/lib/earn-types";
import { formatCalendarEventDate } from "@/lib/calendar-events";

export type DenItemState =
  | "pending"
  | "in_progress"
  | "submitted"
  | "done"
  | "overdue";

export type DenOverviewItem = {
  id: string;
  kind: EarnType | "calendar_event";
  title: string;
  subtitle?: string;
  dateKey: string;
  timeLabel?: string;
  cubName?: string;
  href?: string;
  state: DenItemState;
  calendarEventType?: CalendarEventType;
  sortMinutes: number;
};

export type DenAttentionItem = {
  id: string;
  kind: EarnType | "calendar_event" | "growth_minimum";
  title: string;
  detail: string;
  href?: string;
};

export type DenWeekDay = {
  dateKey: string;
  dayName: string;
  dayNum: number;
  itemCount: number;
  isToday: boolean;
};

export type DenOverviewData = {
  today: DenOverviewItem[];
  weekDays: DenWeekDay[];
  itemsByDay: Record<string, DenOverviewItem[]>;
  upcoming: DenOverviewItem[];
  needsAttention: DenAttentionItem[];
  weekSummary: CubWeekEarnSummary;
};

export function formatDenItemDateLabel(item: DenOverviewItem): string {
  const date = new Date(`${item.dateKey}T00:00:00.000Z`);
  return formatCalendarEventDate(date, item.timeLabel?.split(" – ")[0]);
}

export function denItemStateLabel(state: DenItemState): string {
  switch (state) {
    case "done":
      return "Done";
    case "overdue":
      return "Overdue";
    case "submitted":
      return "Awaiting review";
    case "in_progress":
      return "In progress";
    default:
      return "Scheduled";
  }
}
