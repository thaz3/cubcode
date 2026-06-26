import type { GrowthCategory } from "@/generated/prisma/client";
import { ALL_GROWTH_AREAS, COMPLETION_POINT_VALUE } from "@/lib/unified-growth-areas";

export type GrowthAreaItem = {
  type: "task" | "routine" | "bonus" | "growth_pick";
  id: string;
  title: string;
  completedAt: Date;
  points?: number;
};

export type GrowthAreaAreaStats = {
  completions: number;
  points: number;
  xpEarned: number;
  items: GrowthAreaItem[];
};

export type GrowthAreaSummary = {
  weekLabel: string;
  required: GrowthCategory[];
  byArea: Record<GrowthCategory, GrowthAreaAreaStats>;
  coverage: { met: number; total: number };
  maxPoints: number;
  totalPoints: number;
  growthPicksCompleted: number;
};

export function emptyAreaStats(): GrowthAreaAreaStats {
  return { completions: 0, points: 0, xpEarned: 0, items: [] };
}

export function createEmptyByArea(): Record<GrowthCategory, GrowthAreaAreaStats> {
  return Object.fromEntries(
    ALL_GROWTH_AREAS.map((area) => [area, emptyAreaStats()]),
  ) as Record<GrowthCategory, GrowthAreaAreaStats>;
}

export function mergeGrowthAreaItem(
  byArea: Record<GrowthCategory, GrowthAreaAreaStats>,
  area: GrowthCategory,
  item: GrowthAreaItem,
  pointValue = COMPLETION_POINT_VALUE,
): void {
  const bucket = byArea[area];
  bucket.completions += 1;
  bucket.points += pointValue;
  bucket.items.push(item);
}

export function addGrowthAreaPoints(
  byArea: Record<GrowthCategory, GrowthAreaAreaStats>,
  area: GrowthCategory,
  item: GrowthAreaItem,
  points: number,
): void {
  if (points <= 0) return;
  const bucket = byArea[area];
  bucket.completions += 1;
  bucket.points += points;
  bucket.items.push({ ...item, points });
}

export function computeCoverage(
  required: GrowthCategory[],
  byArea: Record<GrowthCategory, GrowthAreaAreaStats>,
): { met: number; total: number } {
  const total = required.length;
  const met = required.filter((area) => byArea[area].points > 0).length;
  return { met, total };
}

export function computeMaxPoints(
  byArea: Record<GrowthCategory, GrowthAreaAreaStats>,
): number {
  return Math.max(1, ...ALL_GROWTH_AREAS.map((area) => byArea[area].points));
}

export function computeTotalPoints(
  byArea: Record<GrowthCategory, GrowthAreaAreaStats>,
): number {
  return ALL_GROWTH_AREAS.reduce((sum, area) => sum + byArea[area].points, 0);
}

export function finalizeGrowthAreaSummary(
  required: GrowthCategory[],
  byArea: Record<GrowthCategory, GrowthAreaAreaStats>,
  weekLabel: string,
  growthPicksCompleted = 0,
): GrowthAreaSummary {
  for (const area of ALL_GROWTH_AREAS) {
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
    maxPoints: computeMaxPoints(byArea),
    totalPoints: computeTotalPoints(byArea),
    growthPicksCompleted,
  };
}
