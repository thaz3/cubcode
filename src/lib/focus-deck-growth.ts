import type { FocusDeckCategory } from "@/generated/prisma/client";
import { getWeekEnd, getWeekStart, formatWeekLabel } from "@/lib/council-day";
import { db } from "@/lib/db";
import {
  ALL_FOCUS_DECK_CATEGORIES,
  FOCUS_DECK_CATEGORY_LABELS,
  parseFocusDeckCategoryPoints,
} from "@/lib/focus-deck-categories";

export type FocusDeckAreaItem = {
  type: "focus_card";
  id: string;
  title: string;
  points: number;
  completedAt: Date;
};

export type FocusDeckAreaStats = {
  points: number;
  completions: number;
  items: FocusDeckAreaItem[];
};

export type FocusDeckGrowthSummary = {
  weekLabel: string;
  byArea: Record<FocusDeckCategory, FocusDeckAreaStats>;
  totalPoints: number;
  cardsCompleted: number;
};

function emptyStats(): FocusDeckAreaStats {
  return { points: 0, completions: 0, items: [] };
}

function createEmptyByArea(): Record<FocusDeckCategory, FocusDeckAreaStats> {
  return Object.fromEntries(
    ALL_FOCUS_DECK_CATEGORIES.map((area) => [area, emptyStats()]),
  ) as Record<FocusDeckCategory, FocusDeckAreaStats>;
}

export async function getCubFocusDeckGrowthSummary(
  cubId: string,
  weekStartsOn = getWeekStart(),
): Promise<FocusDeckGrowthSummary> {
  const weekEnd = getWeekEnd(weekStartsOn);
  const byArea = createEmptyByArea();

  const completions = await db.focusActivityCompletion.findMany({
    where: {
      cubId,
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
  });

  let totalPoints = 0;

  for (const completion of completions) {
    const reviewedAt = completion.reviewedAt;
    if (!reviewedAt) continue;

    const categoryPoints = parseFocusDeckCategoryPoints(completion.card.categoryPoints);
    if (!categoryPoints) continue;

    for (const category of ALL_FOCUS_DECK_CATEGORIES) {
      const points = categoryPoints[category] ?? 0;
      if (points <= 0) continue;

      byArea[category].points += points;
      byArea[category].completions += 1;
      byArea[category].items.push({
        type: "focus_card",
        id: completion.id,
        title: completion.card.title,
        points,
        completedAt: reviewedAt,
      });
      totalPoints += points;
    }
  }

  for (const category of ALL_FOCUS_DECK_CATEGORIES) {
    byArea[category].items = byArea[category].items.slice(0, 8);
  }

  return {
    weekLabel: formatWeekLabel(weekStartsOn),
    byArea,
    totalPoints,
    cardsCompleted: completions.length,
  };
}

export { FOCUS_DECK_CATEGORY_LABELS } from "@/lib/focus-deck-categories";
