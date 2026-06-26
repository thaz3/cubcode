import { getCubTrainingBoardSummary } from "@/lib/cub-training-board-summary";
import { getCubWeeklyFocusStack } from "@/lib/cub-focus-deck-week";
import { getCubRoutinesDueToday } from "@/lib/cub-routines";
import { DEFAULT_GROWTH_PICK_WEEKLY_MINIMUM } from "@/lib/earn-types";
import { db } from "@/lib/db";
import {
  filterTasksForCubWeekView,
  sortTasksByUrgency,
} from "@/lib/task-schedule";
import { ACTIVE_CUB_STATUSES } from "@/lib/task-transitions";
import { getTaskEarnType } from "@/lib/earn-types";

export type CubWeekEarnSummary = {
  routinesCompleted: number;
  tasksCompleted: number;
  growthPicksCompleted: number;
  growthPicksMinimum: number;
  trainingPathCurrentLevel: string | null;
  trainingPathProgressLabel: string | null;
  bonusPointsAwarded: number;
};

export type ActiveMission = {
  id: string;
  sourceId: string;
  earnType: "routine" | "task" | "growth_pick" | "training_path";
  title: string;
  href: string;
  statusLabel?: string;
};

/** @deprecated Use ActiveMission */
export type TodayMission = ActiveMission;

export function getCubMissionHref(
  cubId: string,
  mission: Pick<ActiveMission, "earnType" | "sourceId">,
): string {
  switch (mission.earnType) {
    case "routine":
      return `/cub/${cubId}/challenges/${mission.sourceId}`;
    case "growth_pick":
      return `/cub/${cubId}/focus-deck#pick-${mission.sourceId}`;
    case "task":
    case "training_path":
      return `/cub/${cubId}/challenges#mission-${mission.sourceId}`;
  }
}

function formatMissionStatus(status: string): string {
  return status.replaceAll("_", " ").toLowerCase();
}

function routineStatusLabel(
  logStatus: string | null | undefined,
): string {
  if (!logStatus || logStatus === "PENDING") return "Due today";
  return formatMissionStatus(logStatus);
}

export async function getCubWeekEarnSummary(
  familyId: string,
  cubId: string,
  weekStartsOn: Date,
  growthPicksMinimum = DEFAULT_GROWTH_PICK_WEEKLY_MINIMUM,
): Promise<CubWeekEarnSummary> {
  const weekEnd = new Date(weekStartsOn);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const [
    routinesCompleted,
    tasksCompleted,
    growthPicksCompleted,
    bonusPointsAwarded,
    trainingSummary,
  ] = await Promise.all([
    db.challengeProgressLog.count({
      where: {
        familyId,
        cubId,
        status: "REWARDED",
        reviewedAt: { gte: weekStartsOn, lt: weekEnd },
      },
    }),
    db.task.count({
      where: {
        familyId,
        cubId,
        status: { in: ["APPROVED", "COMPLETED"] },
        reviewedAt: { gte: weekStartsOn, lt: weekEnd },
        trainingDeckId: null,
        focusActivityCardId: null,
      },
    }),
    db.focusActivityCompletion.count({
      where: {
        familyId,
        cubId,
        status: "REWARDED",
        reviewedAt: { gte: weekStartsOn, lt: weekEnd },
      },
    }),
    db.xpLedgerEntry.aggregate({
      where: {
        cubId,
        reason: "PARENT_ADJUSTMENT",
        createdAt: { gte: weekStartsOn, lt: weekEnd },
      },
      _sum: { amount: true },
    }),
    getCubTrainingBoardSummary(familyId, cubId),
  ]);

  const active = trainingSummary.activeMilestone;

  return {
    routinesCompleted,
    tasksCompleted,
    growthPicksCompleted,
    growthPicksMinimum,
    trainingPathCurrentLevel: active?.title ?? null,
    trainingPathProgressLabel: active
      ? `Level ${active.milestoneNumber} · ${active.approvedCount}/${active.totalCards} lessons`
      : trainingSummary.totalDecks > 0
        ? `${trainingSummary.completedDecks}/${trainingSummary.totalDecks} levels complete`
        : null,
    bonusPointsAwarded: bonusPointsAwarded._sum.amount ?? 0,
  };
}

export async function getCubActiveMissions(
  familyId: string,
  cubId: string,
  weekStartsOn: Date,
): Promise<ActiveMission[]> {
  const [assignedTasks, routinesDueToday, focusWeekCards] = await Promise.all([
    db.task.findMany({
      where: {
        familyId,
        cubId,
        status: { in: ACTIVE_CUB_STATUSES },
      },
      select: {
        id: true,
        title: true,
        status: true,
        focusActivityCardId: true,
        trainingDeckId: true,
        dueAt: true,
        dueAtHasTime: true,
        claimedAt: true,
        createdAt: true,
      },
    }),
    getCubRoutinesDueToday(familyId, cubId),
    getCubWeeklyFocusStack(familyId, cubId, weekStartsOn),
  ]);

  const missions: ActiveMission[] = [];

  for (const routine of routinesDueToday) {
    if (routine.logStatus === "REWARDED") continue;

    missions.push({
      id: `routine-${routine.id}`,
      sourceId: routine.id,
      earnType: "routine",
      title: routine.title,
      href: getCubMissionHref(cubId, {
        earnType: "routine",
        sourceId: routine.id,
      }),
      statusLabel: routineStatusLabel(routine.logStatus),
    });
  }

  const activeWeekTasks = sortTasksByUrgency(
    filterTasksForCubWeekView(assignedTasks, weekStartsOn),
  );

  for (const task of activeWeekTasks) {
    // CLAIMED = parent assigned but kid hasn't opened instructions yet — Next Step handles that.
    if (task.status === "CLAIMED") continue;

    const earnType = getTaskEarnType(task);
    missions.push({
      id: `task-${task.id}`,
      sourceId: task.id,
      earnType,
      title: task.title,
      href: getCubMissionHref(cubId, { earnType, sourceId: task.id }),
      statusLabel: formatMissionStatus(task.status),
    });
  }

  for (const card of focusWeekCards) {
    if (card.status === "REWARDED") continue;

    missions.push({
      id: `growth-${card.stackItemId}`,
      sourceId: card.cardId,
      earnType: "growth_pick",
      title: card.title,
      href: getCubMissionHref(cubId, {
        earnType: "growth_pick",
        sourceId: card.cardId,
      }),
      statusLabel: card.statusLabel,
    });
  }

  return missions;
}

/** @deprecated Use getCubActiveMissions */
export async function getCubTodayMissions(
  familyId: string,
  cubId: string,
  weekStartsOn: Date,
): Promise<ActiveMission[]> {
  return getCubActiveMissions(familyId, cubId, weekStartsOn);
}

export async function getCubRoutinesCompletedThisWeek(
  familyId: string,
  cubId: string,
  weekStartsOn: Date,
): Promise<number> {
  const weekEnd = new Date(weekStartsOn);
  weekEnd.setDate(weekEnd.getDate() + 7);

  return db.challengeProgressLog.count({
    where: {
      familyId,
      cubId,
      status: "REWARDED",
      reviewedAt: { gte: weekStartsOn, lt: weekEnd },
    },
  });
}
