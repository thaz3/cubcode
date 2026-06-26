import type {
  CalendarEvent,
  Task,
} from "@/generated/prisma/client";
import { db } from "@/lib/db";
import {
  eventDateToKey,
  formatCalendarEventDate,
  formatEventTimeRange,
  isCalendarEventActive,
} from "@/lib/calendar-events";
import { getCubWeeklyFocusStack } from "@/lib/cub-focus-deck-week";
import { getCubRoutinesView } from "@/lib/cub-routines";
import {
  getCubWeekEarnSummary,
  type CubWeekEarnSummary,
} from "@/lib/cub-week-earn-summary";
import { getTaskEarnType, type EarnType } from "@/lib/earn-types";
import {
  calendarDayStartUtc,
  daysUntilDue,
  formatDueScheduleDate,
  isTaskOverdue,
  type TaskScheduleInput,
} from "@/lib/task-schedule";
import { PARENT_CUB_COMPLETED_STATUSES } from "@/lib/task-transitions";

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
  calendarEventType?: CalendarEvent["eventType"];
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

type CubRef = { id: string; displayName: string };

type TaskWithSchedule = Pick<
  Task,
  | "id"
  | "title"
  | "status"
  | "dueAt"
  | "dueAtHasTime"
  | "focusActivityCardId"
  | "trainingDeckId"
  | "cubId"
  | "claimedAt"
  | "createdAt"
>;

type CalendarEventWithTask = CalendarEvent & {
  linkedTask: TaskScheduleInput & Pick<Task, "id" | "title"> | null;
  cub: Pick<{ displayName: string }, "displayName"> | null;
};

function todayDateKey(now = new Date()): string {
  return calendarDayStartUtc(now).toISOString().slice(0, 10);
}

function weekDayKeys(weekStartsOn: Date): string[] {
  const keys: string[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStartsOn);
    day.setDate(day.getDate() + i);
    keys.push(calendarDayStartUtc(day).toISOString().slice(0, 10));
  }
  return keys;
}

function taskDateKey(task: Pick<Task, "dueAt">): string | null {
  if (!task.dueAt) return null;
  return eventDateToKey(task.dueAt);
}

function taskSortMinutes(
  dueAt: Date | null,
  dueAtHasTime: boolean,
  startTime?: string | null,
): number {
  if (dueAtHasTime && dueAt) {
    return dueAt.getTime();
  }
  if (startTime) {
    const [hours, minutes] = startTime.split(":").map(Number);
    return (hours ?? 0) * 60 + (minutes ?? 0);
  }
  return 12 * 60;
}

function taskDenState(task: TaskScheduleInput): DenItemState {
  if (PARENT_CUB_COMPLETED_STATUSES.includes(task.status)) {
    return "done";
  }
  if (isTaskOverdue(task)) {
    return "overdue";
  }
  if (task.status === "SUBMITTED") {
    return "submitted";
  }
  if (task.status === "IN_PROGRESS" || task.status === "CLAIMED") {
    return "in_progress";
  }
  return "pending";
}

function taskHref(cubId: string, taskId: string): string {
  return `/cub/${cubId}/tasks#mission-${taskId}`;
}

function taskToDenItem(
  task: TaskWithSchedule,
  cubName: string,
  cubId: string,
): DenOverviewItem | null {
  if (!task.dueAt) return null;

  const earnType = getTaskEarnType(task);
  const dateKey = taskDateKey(task)!;
  const timeLabel = task.dueAtHasTime
    ? formatDueScheduleDate(task.dueAt, true).split(", ").pop()
    : undefined;

  return {
    id: `task-${task.id}`,
    kind: earnType,
    title: task.title,
    subtitle: taskDenState(task) === "done" ? "Completed" : undefined,
    dateKey,
    timeLabel: timeLabel ?? undefined,
    cubName,
    href: taskHref(cubId, task.id),
    state: taskDenState(task),
    sortMinutes: taskSortMinutes(task.dueAt, task.dueAtHasTime ?? false),
  };
}

function calendarEventState(
  event: CalendarEventWithTask,
): DenItemState {
  if (event.status === "COMPLETED") return "done";
  if (event.status === "CANCELLED") return "done";
  if (event.linkedTask) {
    return taskDenState(event.linkedTask);
  }
  return "pending";
}

function calendarEventToDenItem(event: CalendarEventWithTask): DenOverviewItem {
  const cubName = event.cub?.displayName;
  const dateKey = eventDateToKey(event.eventDate);
  const linked = event.linkedTask;

  return {
    id: `event-${event.id}`,
    kind: "calendar_event",
    title: event.title,
    subtitle: linked
      ? linked.title !== event.title
        ? `Linked: ${linked.title}`
        : undefined
      : event.description ?? undefined,
    dateKey,
    timeLabel: formatEventTimeRange(event.startTime, event.endTime) ?? undefined,
    cubName: cubName ?? undefined,
    state: calendarEventState(event),
    calendarEventType: event.eventType,
    sortMinutes: taskSortMinutes(event.eventDate, false, event.startTime),
  };
}

function compareDenItems(a: DenOverviewItem, b: DenOverviewItem): number {
  if (a.sortMinutes !== b.sortMinutes) {
    return a.sortMinutes - b.sortMinutes;
  }
  return a.title.localeCompare(b.title);
}

function addToDayMap(
  map: Record<string, DenOverviewItem[]>,
  item: DenOverviewItem,
) {
  if (!map[item.dateKey]) {
    map[item.dateKey] = [];
  }
  map[item.dateKey].push(item);
}

export async function getDenOverviewData(
  familyId: string,
  cub: CubRef,
  weekStartsOn: Date,
  now = new Date(),
): Promise<DenOverviewData> {
  const weekEnd = new Date(weekStartsOn);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const todayKey = todayDateKey(now);
  const dayKeys = weekDayKeys(weekStartsOn);

  const [
    tasks,
    calendarEvents,
    routinesView,
    focusWeekCards,
    weekSummary,
    submittedTasks,
    submittedFocus,
    submittedRoutines,
  ] = await Promise.all([
    db.task.findMany({
      where: {
        familyId,
        cubId: cub.id,
        dueAt: { not: null },
      },
      select: {
        id: true,
        title: true,
        status: true,
        dueAt: true,
        dueAtHasTime: true,
        focusActivityCardId: true,
        trainingDeckId: true,
        cubId: true,
        claimedAt: true,
        createdAt: true,
      },
    }),
    db.calendarEvent.findMany({
      where: {
        familyId,
        OR: [{ cubId: null }, { cubId: cub.id }],
        eventDate: { gte: weekStartsOn, lt: weekEnd },
        status: { not: "CANCELLED" },
      },
      include: {
        cub: { select: { displayName: true } },
        linkedTask: {
          select: {
            id: true,
            status: true,
            title: true,
            dueAt: true,
            dueAtHasTime: true,
            claimedAt: true,
            createdAt: true,
          },
        },
      },
      orderBy: [{ eventDate: "asc" }, { startTime: "asc" }],
    }),
    getCubRoutinesView(familyId, cub.id),
    getCubWeeklyFocusStack(familyId, cub.id, weekStartsOn),
    getCubWeekEarnSummary(familyId, cub.id, weekStartsOn),
    db.task.count({
      where: { familyId, cubId: cub.id, status: "SUBMITTED" },
    }),
    db.focusActivityCompletion.count({
      where: { familyId, cubId: cub.id, status: "SUBMITTED" },
    }),
    db.challengeProgressLog.count({
      where: {
        familyId,
        cubId: cub.id,
        status: "SUBMITTED",
      },
    }),
  ]);

  const itemsByDay: Record<string, DenOverviewItem[]> = {};
  for (const key of dayKeys) {
    itemsByDay[key] = [];
  }

  const today: DenOverviewItem[] = [];
  const upcoming: DenOverviewItem[] = [];
  const needsAttention: DenAttentionItem[] = [];

  for (const task of tasks) {
    const item = taskToDenItem(task, cub.displayName, cub.id);
    if (!item) continue;

    if (dayKeys.includes(item.dateKey)) {
      addToDayMap(itemsByDay, item);
    }

    if (item.dateKey === todayKey) {
      today.push(item);
    } else if (item.dateKey > todayKey) {
      const daysOut = daysUntilDue(task.dueAt!, now);
      if (daysOut > 0 && daysOut <= 14) {
        upcoming.push(item);
      }
    }

    if (isTaskOverdue(task)) {
      needsAttention.push({
        id: `overdue-${task.id}`,
        kind: getTaskEarnType(task),
        title: task.title,
        detail: "Overdue assignment",
        href: taskHref(cub.id, task.id),
      });
    }
  }

  for (const event of calendarEvents as CalendarEventWithTask[]) {
    if (!isCalendarEventActive(event.status)) continue;

    const item = calendarEventToDenItem(event);
    if (dayKeys.includes(item.dateKey)) {
      addToDayMap(itemsByDay, item);
    }
    if (item.dateKey === todayKey) {
      today.push(item);
    } else if (item.dateKey > todayKey) {
      upcoming.push(item);
    }
  }

  for (const routine of routinesView.dueToday) {
    const state: DenItemState =
      routine.logStatus === "REWARDED"
        ? "done"
        : routine.logStatus === "SUBMITTED"
          ? "submitted"
          : routine.logStatus === "PENDING" || !routine.logStatus
            ? "pending"
            : "in_progress";

    const item: DenOverviewItem = {
      id: `routine-${routine.id}`,
      kind: "routine",
      title: routine.title,
      subtitle: routine.intervalLabel ?? undefined,
      dateKey: todayKey,
      cubName: cub.displayName,
      href: `/cub/${cub.id}/challenges/${routine.id}`,
      state,
      sortMinutes: 8 * 60,
    };
    today.push(item);
    addToDayMap(itemsByDay, item);

    if (
      (routine.logStatus === "PENDING" || !routine.logStatus) &&
      state !== "done"
    ) {
      needsAttention.push({
        id: `routine-missed-${routine.id}`,
        kind: "routine",
        title: routine.title,
        detail: "Routine due today — not completed yet",
        href: `/cub/${cub.id}/challenges/${routine.id}`,
      });
    }
  }

  for (const card of focusWeekCards) {
    if (card.status === "REWARDED") continue;

    const item: DenOverviewItem = {
      id: `growth-${card.stackItemId}`,
      kind: "growth_pick",
      title: card.title,
      subtitle: card.statusLabel,
      dateKey: todayKey,
      cubName: cub.displayName,
      href: `/cub/${cub.id}/focus-deck#pick-${card.cardId}`,
      state:
        card.status === "SUBMITTED"
          ? "submitted"
          : card.status === "IN_PROGRESS"
            ? "in_progress"
            : "pending",
      sortMinutes: 10 * 60,
    };
    today.push(item);
  }

  if (weekSummary.growthPicksCompleted < weekSummary.growthPicksMinimum) {
    needsAttention.push({
      id: "growth-minimum",
      kind: "growth_minimum",
      title: "Growth Pick weekly minimum",
      detail: `${weekSummary.growthPicksCompleted}/${weekSummary.growthPicksMinimum} completed this week`,
      href: `/cub/${cub.id}/focus-deck`,
    });
  }

  if (submittedTasks > 0) {
    needsAttention.push({
      id: "submitted-tasks",
      kind: "task",
      title: `${submittedTasks} assignment${submittedTasks === 1 ? "" : "s"} awaiting review`,
      detail: "Waiting for parent review",
      href: `/cub/${cub.id}/tasks`,
    });
  }

  if (submittedFocus > 0) {
    needsAttention.push({
      id: "submitted-growth",
      kind: "growth_pick",
      title: `${submittedFocus} Growth Pick${submittedFocus === 1 ? "" : "s"} awaiting review`,
      detail: "Waiting for parent review",
      href: `/cub/${cub.id}/focus-deck`,
    });
  }

  if (submittedRoutines > 0) {
    needsAttention.push({
      id: "submitted-routines",
      kind: "routine",
      title: `${submittedRoutines} routine${submittedRoutines === 1 ? "" : "s"} awaiting review`,
      detail: "Waiting for parent review",
      href: `/cub/${cub.id}/challenges`,
    });
  }

  const futureEvents = await db.calendarEvent.findMany({
    where: {
      familyId,
      OR: [{ cubId: null }, { cubId: cub.id }],
      eventDate: { gte: calendarDayStartUtc(now) },
      status: "SCHEDULED",
    },
    include: {
      cub: { select: { displayName: true } },
      linkedTask: {
        select: {
          id: true,
          status: true,
          title: true,
          dueAt: true,
          dueAtHasTime: true,
          claimedAt: true,
          createdAt: true,
        },
      },
    },
    orderBy: [{ eventDate: "asc" }, { startTime: "asc" }],
    take: 10,
  });

  for (const event of futureEvents as CalendarEventWithTask[]) {
    const item = calendarEventToDenItem(event);
    if (item.dateKey > todayKey && !upcoming.some((u) => u.id === item.id)) {
      upcoming.push(item);
    }
  }

  today.sort(compareDenItems);
  for (const key of dayKeys) {
    itemsByDay[key].sort(compareDenItems);
  }

  upcoming.sort((a, b) => {
    if (a.dateKey !== b.dateKey) return a.dateKey.localeCompare(b.dateKey);
    return compareDenItems(a, b);
  });

  const weekDays: DenWeekDay[] = dayKeys.map((dateKey) => {
    const date = new Date(`${dateKey}T00:00:00.000Z`);
    return {
      dateKey,
      dayName: date.toLocaleDateString(undefined, {
        weekday: "short",
        timeZone: "UTC",
      }),
      dayNum: date.getUTCDate(),
      itemCount: itemsByDay[dateKey]?.length ?? 0,
      isToday: dateKey === todayKey,
    };
  });

  return {
    today,
    weekDays,
    itemsByDay,
    upcoming: upcoming.slice(0, 5),
    needsAttention,
    weekSummary,
  };
}

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
