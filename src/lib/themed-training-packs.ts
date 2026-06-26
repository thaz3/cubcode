import type { TaskCategory } from "@/generated/prisma/client";

/** Themed learning packs — separate from everyday tasks & routines under Assignments. */
export const THEMED_PACK_CATEGORIES = [
  "SUMMER_LITE",
  "LEGACY_WEEKLY",
] as const satisfies readonly TaskCategory[];

export type ThemedPackCategory = (typeof THEMED_PACK_CATEGORIES)[number];

export const GET_SOME_SUN_LABEL = "Get Some Sun";
export const KNOW_YOUR_ROOTS_LABEL = "Know Your Roots";
export const KNOW_YOUR_CITY_LABEL = "Know Your City";

export const THEMED_PACK_SECTIONS = [
  {
    id: "get-some-sun",
    category: "SUMMER_LITE" as const,
    label: GET_SOME_SUN_LABEL,
    milestone: `Milestone 4 · ${GET_SOME_SUN_LABEL}`,
    description:
      "Outdoor summer learning — parks, libraries, walking observation, family history outside, creative projects, and service.",
    boardHref: null,
    boardLabel: null,
    newHref: "/dashboard/tasks/templates/new?type=summer",
    newLabel: `New ${GET_SOME_SUN_LABEL} pack`,
    accent: "sky" as const,
  },
  {
    id: "know-your-roots",
    category: "LEGACY_WEEKLY" as const,
    label: KNOW_YOUR_ROOTS_LABEL,
    milestone: `Milestone 4 · ${KNOW_YOUR_ROOTS_LABEL}`,
    description:
      "Black history awareness, family identity, elder connection, and community pride.",
    boardHref: "/dashboard/week",
    boardLabel: "Weekly progress",
    newHref: "/dashboard/tasks/templates/new?type=legacy",
    newLabel: `New ${KNOW_YOUR_ROOTS_LABEL} pack`,
    accent: "violet" as const,
  },
  {
    id: "know-your-city",
    category: null,
    label: KNOW_YOUR_CITY_LABEL,
    milestone: `Milestone 4 · ${KNOW_YOUR_CITY_LABEL}`,
    description:
      "Black history in your city — local landmarks, neighborhoods, institutions, and community stories.",
    boardHref: null,
    boardLabel: null,
    newHref: null,
    newLabel: null,
    accent: "amber" as const,
  },
] as const;

export function isThemedPackCategory(
  category: TaskCategory,
): category is ThemedPackCategory {
  return (THEMED_PACK_CATEGORIES as readonly TaskCategory[]).includes(category);
}
