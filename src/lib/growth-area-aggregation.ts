import type { GrowthCategory } from "@/generated/prisma/client";
import { ALL_GROWTH_CATEGORIES } from "@/lib/task-categories";

export type GrowthAreaItem = {
  type: "task" | "routine";
  id: string;
  title: string;
  completedAt: Date;
};

export type GrowthAreaAreaStats = {
  completions: number;
  xpEarned: number;
  items: GrowthAreaItem[];
};

export type GrowthAreaSummary = {
  weekLabel: string;
  required: GrowthCategory[];
  byArea: Record<GrowthCategory, GrowthAreaAreaStats>;
  coverage: { met: number; total: number };
  maxCompletions: number;
};

export function emptyAreaStats(): GrowthAreaAreaStats {
  return { completions: 0, xpEarned: 0, items: [] };
}

export function createEmptyByArea(): Record<GrowthCategory, GrowthAreaAreaStats> {
  return Object.fromEntries(
    ALL_GROWTH_CATEGORIES.map((area) => [area, emptyAreaStats()]),
  ) as Record<GrowthCategory, GrowthAreaAreaStats>;
}

export function mergeGrowthAreaItem(
  byArea: Record<GrowthCategory, GrowthAreaAreaStats>,
  area: GrowthCategory,
  item: GrowthAreaItem,
): void {
  const bucket = byArea[area];
  bucket.completions += 1;
  bucket.items.push(item);
}

export function computeCoverage(
  required: GrowthCategory[],
  byArea: Record<GrowthCategory, GrowthAreaAreaStats>,
): { met: number; total: number } {
  const total = required.length;
  const met = required.filter((area) => byArea[area].completions > 0).length;
  return { met, total };
}

export function computeMaxCompletions(
  byArea: Record<GrowthCategory, GrowthAreaAreaStats>,
): number {
  return Math.max(
    1,
    ...ALL_GROWTH_CATEGORIES.map((area) => byArea[area].completions),
  );
}

export function finalizeGrowthAreaSummary(
  required: GrowthCategory[],
  byArea: Record<GrowthCategory, GrowthAreaAreaStats>,
  weekLabel: string,
): GrowthAreaSummary {
  for (const area of ALL_GROWTH_CATEGORIES) {
    byArea[area].items.sort(
      (a, b) => b.completedAt.getTime() - a.completedAt.getTime(),
    );
    byArea[area].items = byArea[area].items.slice(0, 8);
  }

  return {
    weekLabel,
    required,
    byArea,
    coverage: computeCoverage(required, byArea),
    maxCompletions: computeMaxCompletions(byArea),
  };
}
