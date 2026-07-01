import type { FocusDeckCategory } from "@/generated/prisma/client";
import { ALL_GROWTH_AREAS } from "@/lib/unified-growth-areas";
import { growthCategoryShortLabel } from "@/lib/task-categories";

export const ALL_FOCUS_DECK_CATEGORIES = [
  ...ALL_GROWTH_AREAS,
] as FocusDeckCategory[];

export const FOCUS_DECK_CATEGORY_LABELS: Record<FocusDeckCategory, string> =
  Object.fromEntries(
    ALL_FOCUS_DECK_CATEGORIES.map((category) => [
      category,
      growthCategoryShortLabel(category),
    ]),
  ) as Record<FocusDeckCategory, string>;

export type FocusDeckCategoryPoints = Partial<Record<FocusDeckCategory, number>>;

const CATEGORY_KEY_MAP: Record<string, FocusDeckCategory> = {
  mind: "MIND",
  body: "BODY",
  character: "CHARACTER",
  creativity: "CREATIVITY",
  responsibility: "RESPONSIBILITY",
  family: "FAMILY",
  community: "COMMUNITY",
  wellness: "BODY",
};

export function parseFocusDeckCategoryPoints(
  value: unknown,
): FocusDeckCategoryPoints | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const parsed: FocusDeckCategoryPoints = {};

  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    const category = CATEGORY_KEY_MAP[key.toLowerCase()] ?? (key as FocusDeckCategory);
    if (!ALL_FOCUS_DECK_CATEGORIES.includes(category)) {
      continue;
    }
    const points = Number(raw);
    if (!Number.isFinite(points) || points <= 0) {
      continue;
    }
    parsed[category] = Math.floor(points);
  }

  return Object.keys(parsed).length > 0 ? parsed : null;
}

export function formatFocusDeckCategoryPoints(
  points: FocusDeckCategoryPoints,
): string {
  return ALL_FOCUS_DECK_CATEGORIES.filter((category) => (points[category] ?? 0) > 0)
    .map((category) => `${FOCUS_DECK_CATEGORY_LABELS[category]} +${points[category]}`)
    .join(" · ");
}

export function totalFocusDeckPoints(points: FocusDeckCategoryPoints): number {
  return ALL_FOCUS_DECK_CATEGORIES.reduce(
    (sum, category) => sum + (points[category] ?? 0),
    0,
  );
}

export function categoryPointsFromForm(formData: FormData): FocusDeckCategoryPoints {
  const points: FocusDeckCategoryPoints = {};

  for (const category of ALL_FOCUS_DECK_CATEGORIES) {
    const raw = formData.get(`categoryPoints.${category.toLowerCase()}`);
    if (!raw) continue;
    const value = Number(raw);
    if (Number.isFinite(value) && value > 0) {
      points[category] = Math.floor(value);
    }
  }

  return points;
}
