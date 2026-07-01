import type { FocusDeckCategory, GrowthCategory } from "@/generated/prisma/client";
import { z } from "zod";

/** Canonical seven Cub Codes — shared by tasks, routines, and Growth Picks. */
export const ALL_GROWTH_AREAS = [
  "MIND",
  "BODY",
  "CHARACTER",
  "RESPONSIBILITY",
  "CREATIVITY",
  "FAMILY",
  "COMMUNITY",
] as const satisfies readonly GrowthCategory[];

export type GrowthArea = (typeof ALL_GROWTH_AREAS)[number];

export const GROWTH_CATEGORY_VALUES = [...ALL_GROWTH_AREAS] as [
  GrowthArea,
  ...GrowthArea[],
];

export const growthCategorySchema = z.enum(GROWTH_CATEGORY_VALUES);

/** Maps pre-unification enum values still stored in JSON or external data. */
const LEGACY_GROWTH_CATEGORY_MAP: Record<string, GrowthArea> = {
  CONTROL: "RESPONSIBILITY",
  USE: "CREATIVITY",
  BUILD: "CREATIVITY",
  WELLNESS: "BODY",
  MIND: "MIND",
  BODY: "BODY",
  CHARACTER: "CHARACTER",
  CREATIVITY: "CREATIVITY",
  RESPONSIBILITY: "RESPONSIBILITY",
  FAMILY: "FAMILY",
  COMMUNITY: "COMMUNITY",
};

export function normalizeGrowthArea(
  value: string | GrowthCategory | FocusDeckCategory | null | undefined,
): GrowthArea | null {
  if (!value) return null;
  const mapped = LEGACY_GROWTH_CATEGORY_MAP[value];
  return mapped ?? null;
}

export function normalizeRequiredGrowthAreas(
  values: unknown,
): GrowthArea[] {
  if (!Array.isArray(values)) {
    return [...ALL_GROWTH_AREAS];
  }

  const normalized = values
    .map((value) => (typeof value === "string" ? normalizeGrowthArea(value) : null))
    .filter((value): value is GrowthArea => value != null);

  const unique = [...new Set(normalized)];

  const isLegacyConfig =
    Array.isArray(values) &&
    values.some(
      (value) =>
        typeof value === "string" &&
        (value === "CONTROL" ||
          value === "USE" ||
          value === "BUILD" ||
          value === "WELLNESS"),
    );

  if (isLegacyConfig || unique.length < ALL_GROWTH_AREAS.length) {
    return [...ALL_GROWTH_AREAS];
  }

  return unique.length > 0 ? unique : [...ALL_GROWTH_AREAS];
}

/** Task / routine completions count as 1 point toward the unified chart. */
export const COMPLETION_POINT_VALUE = 1;

/** Coverage ring fills completely after this many completions in one growth area. */
export const GROWTH_RING_FULL_COMPLETIONS = 7;

export function growthRingSweepPercent(completions: number): number {
  if (completions <= 0) {
    return 0;
  }
  return Math.min(100, (completions / GROWTH_RING_FULL_COMPLETIONS) * 100);
}
