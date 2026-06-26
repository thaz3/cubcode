import type {
  CalendarEventStatus,
  CalendarEventType,
} from "@/generated/prisma/client";

export const CALENDAR_EVENT_TYPES = [
  "APPOINTMENT",
  "SCHOOL",
  "ACTIVITY",
  "FAMILY",
  "DEADLINE",
  "REVIEW",
] as const satisfies readonly CalendarEventType[];

export type CalendarEventTypeMeta = {
  label: string;
  shortLabel: string;
  badgeClass: string;
};

export const CALENDAR_EVENT_TYPE_META: Record<
  CalendarEventType,
  CalendarEventTypeMeta
> = {
  APPOINTMENT: {
    label: "Appointment",
    shortLabel: "Appt",
    badgeClass:
      "bg-teal-950/90 text-teal-200 ring-1 ring-teal-400/35",
  },
  SCHOOL: {
    label: "School",
    shortLabel: "School",
    badgeClass:
      "bg-slate-800/90 text-slate-200 ring-1 ring-slate-400/35",
  },
  ACTIVITY: {
    label: "Activity",
    shortLabel: "Activity",
    badgeClass:
      "bg-teal-950/80 text-teal-100 ring-1 ring-teal-500/30",
  },
  FAMILY: {
    label: "Family",
    shortLabel: "Family",
    badgeClass:
      "bg-cyan-950/90 text-cyan-200 ring-1 ring-cyan-400/35",
  },
  DEADLINE: {
    label: "Deadline",
    shortLabel: "Deadline",
    badgeClass:
      "bg-slate-800/90 text-slate-300 ring-1 ring-slate-500/35",
  },
  REVIEW: {
    label: "Review",
    shortLabel: "Review",
    badgeClass:
      "bg-teal-950/90 text-teal-200 ring-1 ring-teal-400/35",
  },
};

export function getCalendarEventTypeMeta(eventType: CalendarEventType) {
  return CALENDAR_EVENT_TYPE_META[eventType];
}

export function formatCalendarEventTypeLabel(eventType: CalendarEventType) {
  return getCalendarEventTypeMeta(eventType).label;
}

export function parseEventDateInput(dateValue: string): Date {
  const [year, month, day] = dateValue.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function eventDateToKey(eventDate: Date): string {
  return eventDate.toISOString().slice(0, 10);
}

export function formatEventTimeRange(
  startTime?: string | null,
  endTime?: string | null,
): string | null {
  if (!startTime && !endTime) return null;
  if (startTime && endTime) return `${startTime} – ${endTime}`;
  return startTime ?? endTime ?? null;
}

export function formatCalendarEventDate(
  eventDate: Date,
  startTime?: string | null,
): string {
  const dateLabel = eventDate.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  if (!startTime) return dateLabel;
  return `${dateLabel} · ${startTime}`;
}

export function isCalendarEventActive(status: CalendarEventStatus): boolean {
  return status === "SCHEDULED";
}
