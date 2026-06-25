import type { GrowthCategory } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import {
  ALL_GROWTH_CATEGORIES,
  getFocusAreaClaimEligibility,
  type FocusAreaClaimEligibility,
} from "@/lib/focus-growth";

export type GrowthBoardTask = {
  id: string;
  title: string;
  status: string;
  category: string;
};

export type GrowthAreaBoard = {
  area: GrowthCategory;
  focusEligibility: FocusAreaClaimEligibility;
  availableToClaim: GrowthBoardTask[];
  focusTemplates: GrowthBoardTask[];
  yours: GrowthBoardTask[];
};

export type GrowthBoardView = {
  swapCredits: number;
  areas: GrowthAreaBoard[];
};

export async function getGrowthBoardView(
  cub: Parameters<typeof getFocusAreaClaimEligibility>[0],
  familyId: string,
): Promise<GrowthBoardView> {
  const [availableTasks, yourTasks] = await Promise.all([
    db.task.findMany({
      where: {
        familyId,
        status: "AVAILABLE",
        growthCategory: { not: null },
      },
      select: {
        id: true,
        title: true,
        status: true,
        category: true,
        growthCategory: true,
      },
      orderBy: { title: "asc" },
    }),
    db.task.findMany({
      where: {
        familyId,
        cubId: cub.id,
        growthCategory: { not: null },
        status: { in: ["CLAIMED", "IN_PROGRESS", "SENT_BACK"] },
      },
      select: {
        id: true,
        title: true,
        status: true,
        category: true,
        growthCategory: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const focusTemplates = availableTasks.filter((t) => t.category === "FOCUS_BLOCK");
  const boardTasks = availableTasks.filter((t) => t.category !== "FOCUS_BLOCK");

  const areas = await Promise.all(
    ALL_GROWTH_CATEGORIES.map(async (area) => ({
      area,
      focusEligibility: await getFocusAreaClaimEligibility(cub, area),
      availableToClaim: boardTasks
        .filter((t) => t.growthCategory === area)
        .map((t) => ({
          id: t.id,
          title: t.title,
          status: t.status,
          category: t.category,
        })),
      focusTemplates: focusTemplates
        .filter((t) => !t.growthCategory || t.growthCategory === area)
        .map((t) => ({
          id: t.id,
          title: t.title,
          status: t.status,
          category: t.category,
        })),
      yours: yourTasks
        .filter((t) => t.growthCategory === area)
        .map((t) => ({
          id: t.id,
          title: t.title,
          status: t.status,
          category: t.category,
        })),
    })),
  );

  return {
    swapCredits: cub.focusAreaSwapCredits ?? 0,
    areas,
  };
}
