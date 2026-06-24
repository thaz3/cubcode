import type { Cub } from "@/generated/prisma/client";
import {
  formatWeekLabel,
  getWeekEnd,
  isCouncilDayEntryComplete,
} from "@/lib/council-day";
import { getCubWeekStats } from "@/lib/council-day-stats";
import { parseCouncilDayValueRatings } from "@/lib/council-day-values";
import { getCubLedgerEntries, type CubLedgerEntry } from "@/lib/cub-ledger";
import { db } from "@/lib/db";

export type CubWeeklyProgressRow = {
  cubId: string;
  displayName: string;
  completedTasks: number;
  focusMinutes: number;
  tasksSubmitted: number;
  submittedAwaitingReview: number;
  xpEarned: number;
  focusTokensEarned: number;
  phoneMinutesEarned: number;
  familyDaySaved: boolean;
  familyDayReady: boolean;
  ledgerEntries: CubLedgerEntry[];
};

export type HouseholdWeeklyProgress = {
  weekLabel: string;
  householdTotals: {
    completedTasks: number;
    focusMinutes: number;
    tasksSubmitted: number;
    xpEarned: number;
    focusTokensEarned: number;
    phoneMinutesEarned: number;
    pendingReview: number;
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
      const [weekStats, ledgers, tasksSubmitted, ledgerEntries] =
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
          limit: 6,
        }),
      ]);

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
        focusMinutes: weekStats.focusMinutes,
        tasksSubmitted,
        submittedAwaitingReview: weekStats.submittedAwaitingReview,
        ...ledgers,
        familyDaySaved: Boolean(entry),
        familyDayReady,
        ledgerEntries,
      };
    }),
  );

  const householdTotals = {
    completedTasks: 0,
    focusMinutes: 0,
    tasksSubmitted: 0,
    xpEarned: 0,
    focusTokensEarned: 0,
    phoneMinutesEarned: 0,
    pendingReview,
  };

  for (const row of cubRows) {
    householdTotals.completedTasks += row.completedTasks;
    householdTotals.focusMinutes += row.focusMinutes;
    householdTotals.tasksSubmitted += row.tasksSubmitted;
    householdTotals.xpEarned += row.xpEarned;
    householdTotals.focusTokensEarned += row.focusTokensEarned;
    householdTotals.phoneMinutesEarned += row.phoneMinutesEarned;
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
