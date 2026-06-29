import type { Cub, TaskStatus } from "@/generated/prisma/client";
import {
  formatWeekLabel,
  getWeekEnd,
  isCouncilDayEntryComplete,
} from "@/lib/council-day";
import { getCubWeekStats } from "@/lib/council-day-stats";
import { parseCouncilDayValueRatings } from "@/lib/council-day-values";
import { getCubLedgerEntries, type CubLedgerEntry } from "@/lib/cub-ledger";
import { db } from "@/lib/db";
import {
  filterTasksForCubWeekView,
  sortTasksByUrgency,
} from "@/lib/task-schedule";

export type WeekAssignedTask = {
  id: string;
  title: string;
  status: TaskStatus;
  dueAt: Date | null;
  dueAtHasTime: boolean;
  claimedAt: Date | null;
  createdAt: Date;
  isUrgent: boolean;
};

export type CubWeeklyProgressRow = {
  cubId: string;
  displayName: string;
  completedTasks: number;
  completedFocusTasks: number;
  focusMinutes: number;
  tasksSubmitted: number;
  submittedAwaitingReview: number;
  xpEarned: number;
  focusTokensEarned: number;
  phoneMinutesEarned: number;
  familyDaySaved: boolean;
  familyDayReady: boolean;
  ledgerEntries: CubLedgerEntry[];
  assignedTasks: WeekAssignedTask[];
};

export type HouseholdWeeklyProgress = {
  weekLabel: string;
  householdTotals: {
    completedTasks: number;
    completedFocusTasks: number;
    focusMinutes: number;
    tasksSubmitted: number;
    xpEarned: number;
    focusTokensEarned: number;
    phoneMinutesEarned: number;
    pendingReview: number;
    tasksAssigned: number;
  };
  familyDay: {
    status: "not_started" | "in_progress" | "completed";
    conductedAt: Date | null;
    cubsReady: number;
    cubsTotal: number;
  };
  cubs: CubWeeklyProgressRow[];
};

async function getCubLedgerWeekTotals(
  cubId: string,
  weekStart: Date,
  weekEnd: Date,
) {
  const [xp, tokens, phone] = await Promise.all([
    db.xpLedgerEntry.aggregate({
      where: { cubId, createdAt: { gte: weekStart, lt: weekEnd } },
      _sum: { amount: true },
    }),
    db.focusTokenLedgerEntry.aggregate({
      where: { cubId, createdAt: { gte: weekStart, lt: weekEnd } },
      _sum: { amount: true },
    }),
    db.phoneTimeLedgerEntry.aggregate({
      where: {
        cubId,
        amount: { gt: 0 },
        createdAt: { gte: weekStart, lt: weekEnd },
      },
      _sum: { amount: true },
    }),
  ]);

  return {
    xpEarned: xp._sum.amount ?? 0,
    focusTokensEarned: tokens._sum.amount ?? 0,
    phoneMinutesEarned: phone._sum.amount ?? 0,
  };
}

export async function getCubWeekEarnedTotals(cubId: string, weekStartsOn: Date) {
  return getCubLedgerWeekTotals(cubId, weekStartsOn, getWeekEnd(weekStartsOn));
}

export async function getHouseholdWeeklyProgress(
  familyId: string,
  cubs: Pick<Cub, "id" | "displayName" | "ageBand">[],
  weekStartsOn: Date,
): Promise<HouseholdWeeklyProgress> {
  const weekEnd = getWeekEnd(weekStartsOn);
  const weekLabel = formatWeekLabel(weekStartsOn);

  const [familyDaySession, pendingReview] = await Promise.all([
    db.councilDaySession.findUnique({
      where: {
        familyId_weekStartsOn: { familyId, weekStartsOn },
      },
      include: { cubEntries: true },
    }),
    db.task.count({
      where: { familyId, status: "SUBMITTED" },
    }),
  ]);

  const cubRows = await Promise.all(
    cubs.map(async (cub) => {
      const [weekStats, ledgers, tasksSubmitted, ledgerEntries, assignedTasks] =
        await Promise.all([
        getCubWeekStats(cub.id, weekStartsOn),
        getCubLedgerWeekTotals(cub.id, weekStartsOn, weekEnd),
        db.task.count({
          where: {
            cubId: cub.id,
            submittedAt: { gte: weekStartsOn, lt: weekEnd },
          },
        }),
        getCubLedgerEntries(cub.id, {
          weekStartsOn: weekStartsOn,
          limit: 20,
        }),
        db.task.findMany({
          where: {
            cubId: cub.id,
            status: { in: ["CLAIMED", "IN_PROGRESS", "SENT_BACK"] },
          },
          select: {
            id: true,
            title: true,
            status: true,
            dueAt: true,
            dueAtHasTime: true,
            claimedAt: true,
            createdAt: true,
            isUrgent: true,
          },
        }),
      ]);

      const weekAssigned = sortTasksByUrgency(
        filterTasksForCubWeekView(assignedTasks, weekStartsOn),
      );

      const entry = familyDaySession?.cubEntries.find(
        (item) => item.cubId === cub.id,
      );
      const valueRatings = parseCouncilDayValueRatings(entry?.valueRatings);
      const familyDayReady = entry
        ? isCouncilDayEntryComplete(cub, {
            winNote: entry.winNote,
            growNote: entry.growNote,
            familyGoalNote: entry.familyGoalNote,
            reflection: entry.reflection,
            valueRatings,
          })
        : false;

      return {
        cubId: cub.id,
        displayName: cub.displayName,
        completedTasks: weekStats.completedTasks,
        completedFocusTasks: weekStats.completedFocusTasks,
        focusMinutes: weekStats.focusMinutes,
        tasksSubmitted,
        submittedAwaitingReview: weekStats.submittedAwaitingReview,
        ...ledgers,
        familyDaySaved: Boolean(entry),
        familyDayReady,
        ledgerEntries,
        assignedTasks: weekAssigned,
      };
    }),
  );

  const householdTotals = {
    completedTasks: 0,
    completedFocusTasks: 0,
    focusMinutes: 0,
    tasksSubmitted: 0,
    xpEarned: 0,
    focusTokensEarned: 0,
    phoneMinutesEarned: 0,
    pendingReview,
    tasksAssigned: 0,
  };

  for (const row of cubRows) {
    householdTotals.completedTasks += row.completedTasks;
    householdTotals.completedFocusTasks += row.completedFocusTasks;
    householdTotals.focusMinutes += row.focusMinutes;
    householdTotals.tasksSubmitted += row.tasksSubmitted;
    householdTotals.xpEarned += row.xpEarned;
    householdTotals.focusTokensEarned += row.focusTokensEarned;
    householdTotals.phoneMinutesEarned += row.phoneMinutesEarned;
    householdTotals.tasksAssigned += row.assignedTasks.length;
  }

  const familyDayStatus = familyDaySession?.conductedAt
    ? "completed"
    : familyDaySession
      ? "in_progress"
      : "not_started";

  return {
    weekLabel,
    householdTotals,
    familyDay: {
      status: familyDayStatus,
      conductedAt: familyDaySession?.conductedAt ?? null,
      cubsReady: cubRows.filter((row) => row.familyDayReady).length,
      cubsTotal: cubs.length,
    },
    cubs: cubRows,
  };
}
