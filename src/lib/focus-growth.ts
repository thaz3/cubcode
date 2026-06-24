import type { Cub, GrowthCategory } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { getWeekStart } from "@/lib/council-day";
import {
  ALL_GROWTH_CATEGORIES,
  GROWTH_CATEGORY_LABELS,
} from "@/lib/task-categories";

export { ALL_GROWTH_CATEGORIES };

export function parseRequiredGrowthCategories(cub: Cub): GrowthCategory[] {
  if (!Array.isArray(cub.requiredGrowthCategories)) {
    return [...ALL_GROWTH_CATEGORIES];
  }

  const parsed = cub.requiredGrowthCategories.filter((value): value is GrowthCategory =>
    ALL_GROWTH_CATEGORIES.includes(value as GrowthCategory),
  );

  return parsed.length > 0 ? parsed : [...ALL_GROWTH_CATEGORIES];
}

export function growthCategoryOptionsForCub(cub: Cub) {
  return parseRequiredGrowthCategories(cub).map((value) => ({
    value,
    label: GROWTH_CATEGORY_LABELS[value],
  }));
}

export async function getCompletedGrowthCategoriesThisWeek(
  cubId: string,
  weekStartsOn = getWeekStart(),
): Promise<GrowthCategory[]> {
  const weekEnd = new Date(weekStartsOn);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const tasks = await db.task.findMany({
    where: {
      cubId,
      category: "FOCUS_BLOCK",
      status: "COMPLETED",
      growthCategory: { not: null },
      reviewedAt: {
        gte: weekStartsOn,
        lt: weekEnd,
      },
    },
    select: { growthCategory: true },
  });

  return [
    ...new Set(
      tasks
        .map((task) => task.growthCategory)
        .filter((value): value is GrowthCategory => value != null),
    ),
  ];
}

export async function getAvailableGrowthCategoriesForCub(
  cub: Cub,
  weekStartsOn = getWeekStart(),
): Promise<GrowthCategory[]> {
  const required = parseRequiredGrowthCategories(cub);
  const completed = await getCompletedGrowthCategoriesThisWeek(cub.id, weekStartsOn);
  return required.filter((category) => !completed.includes(category));
}

export function formatGrowthWeekProgress(
  completed: GrowthCategory[],
  required: GrowthCategory[],
): string {
  return `${completed.length}/${required.length} growth areas this week`;
}

export function focusBlockRewardMultiplier(requiredCount: number): number {
  return requiredCount > 0 ? 1 / requiredCount : 1;
}
