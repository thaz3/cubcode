import type { FocusDeckCategory, GrowthCategory } from "@/generated/prisma/client";

/** Canonical five growth areas — shared by tasks, routines, and Growth Picks. */
export const ALL_GROWTH_AREAS = [
  "CHARACTER",
  "WELLNESS",
  "CREATIVITY",
  "RESPONSIBILITY",
  "COMMUNITY",
] as const satisfies readonly GrowthCategory[];

export type GrowthArea = (typeof ALL_GROWTH_AREAS)[number];

/** Maps pre-unification enum values still stored in JSON or external data. */
const LEGACY_GROWTH_CATEGORY_MAP: Record<string, GrowthArea> = {
  CONTROL: "RESPONSIBILITY",
  USE: "CREATIVITY",
  BUILD: "CREATIVITY",
  CHARACTER: "CHARACTER",
  WELLNESS: "WELLNESS",
  CREATIVITY: "CREATIVITY",
  RESPONSIBILITY: "RESPONSIBILITY",
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
        (value === "CONTROL" || value === "USE" || value === "BUILD"),
    );

  if (isLegacyConfig || unique.length < ALL_GROWTH_AREAS.length) {
    return [...ALL_GROWTH_AREAS];
  }

  return unique.length > 0 ? unique : [...ALL_GROWTH_AREAS];
}

/** Task / routine completions count as 1 point toward the unified chart. */
export const COMPLETION_POINT_VALUE = 1;
