import type { Cub } from "@/generated/prisma/client";
import { formatWeekLabel, getWeekEnd, getWeekStart } from "@/lib/council-day";
import { db } from "@/lib/db";
import {
  addGrowthAreaPoints,
  createEmptyByArea,
  finalizeGrowthAreaSummary,
  mergeGrowthAreaItem,
  type GrowthAreaSummary,
} from "@/lib/growth-area-aggregation";
import { parseRequiredGrowthCategories } from "@/lib/focus-growth";
import {
  ALL_FOCUS_DECK_CATEGORIES,
  parseFocusDeckCategoryPoints,
} from "@/lib/focus-deck-categories";
import { normalizeGrowthArea } from "@/lib/unified-growth-areas";
import { PARENT_CUB_COMPLETED_STATUSES } from "@/lib/task-transitions";
import {
  GROWTH_CATEGORY_LABELS,
  growthCategoryShortLabel,
} from "@/lib/task-categories";

export type {
  GrowthAreaItem,
  GrowthAreaAreaStats,
  GrowthAreaSummary,
} from "@/lib/growth-area-aggregation";

export {
  emptyAreaStats,
  createEmptyByArea,
  mergeGrowthAreaItem,
  addGrowthAreaPoints,
  computeCoverage,
  computeMaxPoints,
  computeTotalPoints,
  finalizeGrowthAreaSummary,
} from "@/lib/growth-area-aggregation";

export async function getCubGrowthAreaSummary(
  cub: Pick<Cub, "id" | "requiredGrowthCategories">,
  weekStartsOn = getWeekStart(),
): Promise<GrowthAreaSummary> {
  const weekEnd = getWeekEnd(weekStartsOn);
  const required = parseRequiredGrowthCategories(cub as Cub);
  const byArea = createEmptyByArea();

  const [tasks, routineLogs, xpEntries, parentBonuses, focusCompletions] =
    await Promise.all([
      db.task.findMany({
        where: {
          cubId: cub.id,
          growthCategory: { not: null },
          status: { in: PARENT_CUB_COMPLETED_STATUSES },
          reviewedAt: { gte: weekStartsOn, lt: weekEnd },
        },
        select: {
          id: true,
          title: true,
          growthCategory: true,
          reviewedAt: true,
        },
        orderBy: { reviewedAt: "desc" },
      }),
      db.challengeProgressLog.findMany({
        where: {
          cubId: cub.id,
          status: "REWARDED",
          reviewedAt: { gte: weekStartsOn, lt: weekEnd },
          challenge: { growthCategory: { not: null } },
        },
        select: {
          id: true,
          reviewedAt: true,
          challenge: {
            select: {
              title: true,
              growthCategory: true,
            },
          },
        },
        orderBy: { reviewedAt: "desc" },
      }),
      db.xpLedgerEntry.findMany({
        where: {
          cubId: cub.id,
          createdAt: { gte: weekStartsOn, lt: weekEnd },
          OR: [
            { sourceTask: { growthCategory: { not: null } } },
            {
              sourceChallengeProgressLog: {
                challenge: { growthCategory: { not: null } },
              },
            },
          ],
        },
        select: {
          amount: true,
          sourceTask: { select: { growthCategory: true } },
          sourceChallengeProgressLog: {
            select: { challenge: { select: { growthCategory: true } } },
          },
        },
      }),
      db.xpLedgerEntry.findMany({
        where: {
          cubId: cub.id,
          reason: "PARENT_ADJUSTMENT",
          growthCategory: { not: null },
          createdAt: { gte: weekStartsOn, lt: weekEnd },
        },
        select: {
          id: true,
          amount: true,
          note: true,
          growthCategory: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      db.focusActivityCompletion.findMany({
        where: {
          cubId: cub.id,
          status: "REWARDED",
          reviewedAt: { gte: weekStartsOn, lt: weekEnd },
        },
        select: {
          id: true,
          reviewedAt: true,
          card: {
            select: {
              title: true,
              categoryPoints: true,
            },
          },
        },
        orderBy: { reviewedAt: "desc" },
      }),
    ]);

  for (const task of tasks) {
    const area = normalizeGrowthArea(task.growthCategory);
    if (!area || !task.reviewedAt) continue;
    mergeGrowthAreaItem(byArea, area, {
      type: "task",
      id: task.id,
      title: task.title,
      completedAt: task.reviewedAt,
    });
  }

  for (const log of routineLogs) {
    const area = normalizeGrowthArea(log.challenge.growthCategory);
    const reviewedAt = log.reviewedAt;
    if (!area || !reviewedAt) continue;
    mergeGrowthAreaItem(byArea, area, {
      type: "routine",
      id: log.id,
      title: log.challenge.title,
      completedAt: reviewedAt,
    });
  }

  for (const entry of xpEntries) {
    const raw =
      entry.sourceTask?.growthCategory ??
      entry.sourceChallengeProgressLog?.challenge.growthCategory;
    const area = normalizeGrowthArea(raw);
    if (!area) continue;
    byArea[area].xpEarned += entry.amount;
  }

  for (const bonus of parentBonuses) {
    const area = normalizeGrowthArea(bonus.growthCategory);
    if (!area) continue;
    mergeGrowthAreaItem(byArea, area, {
      type: "bonus",
      id: bonus.id,
      title: bonus.note?.trim() || "Offline behavior bonus",
      completedAt: bonus.createdAt,
    });
    byArea[area].xpEarned += bonus.amount;
  }

  for (const completion of focusCompletions) {
    const reviewedAt = completion.reviewedAt;
    if (!reviewedAt) continue;

    const categoryPoints = parseFocusDeckCategoryPoints(completion.card.categoryPoints);
    if (!categoryPoints) continue;

    for (const category of ALL_FOCUS_DECK_CATEGORIES) {
      const points = categoryPoints[category] ?? 0;
      if (points <= 0) continue;

      addGrowthAreaPoints(
        byArea,
        category,
        {
          type: "growth_pick",
          id: completion.id,
          title: completion.card.title,
          completedAt: reviewedAt,
          points,
        },
        points,
      );
    }
  }

  return finalizeGrowthAreaSummary(
    required,
    byArea,
    formatWeekLabel(weekStartsOn),
    focusCompletions.length,
  );
}

export { GROWTH_CATEGORY_LABELS, growthCategoryShortLabel };
