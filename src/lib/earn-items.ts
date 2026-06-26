import type { GrowthCategory } from "@/generated/prisma/client";
import {
  getTaskEarnType,
  type EarnItem,
  type EarnItemStatus,
  type EarnType,
} from "@/lib/earn-types";
import { GROWTH_CATEGORY_LABELS } from "@/lib/task-categories";
import { formatChallengeInterval } from "@/lib/challenge-intervals";
import { formatTaskRecurrence } from "@/lib/task-recurrence";

type TaskSource = {
  id: string;
  cubId: string | null;
  title: string;
  description: string | null;
  status: string;
  xpEarned: number;
  dueAt: Date | null;
  recurrence: string;
  growthCategory: GrowthCategory | null;
  focusActivityCardId: string | null;
  trainingDeckId: string | null;
  reviewNote: string | null;
};

type RoutineSource = {
  id: string;
  cubId: string;
  title: string;
  description: string | null;
  xpEarned: number;
  intervalType: Parameters<typeof formatChallengeInterval>[0];
  intervalConfig: unknown;
};

type GrowthPickSource = {
  id: string;
  cubId: string;
  title: string;
  description: string | null;
  xpEarned: number;
  status: string;
  growthAreas: string[] | null;
};

type BonusSource = {
  id: string;
  cubId: string;
  title: string;
  points: number;
  parentNote: string | null;
  growthCategory: GrowthCategory | null;
};

function mapTaskStatus(status: string): EarnItemStatus {
  const normalized = status.toLowerCase();
  if (
    normalized === "available" ||
    normalized === "claimed" ||
    normalized === "in_progress" ||
    normalized === "submitted" ||
    normalized === "sent_back" ||
    normalized === "approved" ||
    normalized === "completed" ||
    normalized === "rejected"
  ) {
    return normalized as EarnItemStatus;
  }
  return "available";
}

export function taskToEarnItem(
  task: TaskSource,
  options?: {
    href?: string;
    trainingLevelTitle?: string | null;
  },
): EarnItem | null {
  if (!task.cubId) return null;

  const earnType = getTaskEarnType(task);

  return {
    id: task.id,
    earnType,
    cubId: task.cubId,
    title: task.title,
    description: task.description,
    points: task.xpEarned,
    status: mapTaskStatus(task.status),
    dueDate: task.dueAt,
    repeat: formatTaskRecurrence(task.recurrence as never) || null,
    growthAreas: task.growthCategory
      ? [GROWTH_CATEGORY_LABELS[task.growthCategory].split(" —")[0]]
      : null,
    trainingLevelId: task.trainingDeckId,
    trainingLevelTitle: options?.trainingLevelTitle ?? null,
    parentNote: task.reviewNote,
    href:
      options?.href ??
      (earnType === "training_path"
        ? `/cub/${task.cubId}/training`
        : `/cub/${task.cubId}/challenges#assignments`),
  };
}

export function routineToEarnItem(
  challenge: RoutineSource,
  options?: { href?: string },
): EarnItem {
  return {
    id: challenge.id,
    earnType: "routine",
    cubId: challenge.cubId,
    title: challenge.title,
    description: challenge.description,
    points: challenge.xpEarned,
    status: "pending",
    dueDate: null,
    repeat: formatChallengeInterval(
      challenge.intervalType,
      challenge.intervalConfig,
    ),
    growthAreas: null,
    trainingLevelId: null,
    trainingLevelTitle: null,
    parentNote: null,
    href: options?.href ?? `/cub/${challenge.cubId}/challenges/${challenge.id}`,
  };
}

export function growthPickToEarnItem(
  pick: GrowthPickSource,
  options?: { href?: string },
): EarnItem {
  return {
    id: pick.id,
    earnType: "growth_pick",
    cubId: pick.cubId,
    title: pick.title,
    description: pick.description,
    points: pick.xpEarned,
    status: mapTaskStatus(pick.status),
    dueDate: null,
    repeat: null,
    growthAreas: pick.growthAreas,
    trainingLevelId: null,
    trainingLevelTitle: null,
    parentNote: null,
    href: options?.href ?? `/cub/${pick.cubId}/focus-deck`,
  };
}

export function bonusToEarnItem(bonus: BonusSource): EarnItem {
  return {
    id: bonus.id,
    earnType: "bonus",
    cubId: bonus.cubId,
    title: bonus.title,
    description: null,
    points: bonus.points,
    status: "rewarded",
    dueDate: null,
    repeat: null,
    growthAreas: bonus.growthCategory
      ? [GROWTH_CATEGORY_LABELS[bonus.growthCategory].split(" —")[0]]
      : null,
    trainingLevelId: null,
    trainingLevelTitle: null,
    parentNote: bonus.parentNote,
    href: `/cub/${bonus.cubId}/progress`,
  };
}

export function groupEarnItemsByType(items: EarnItem[]): Record<EarnType, EarnItem[]> {
  return items.reduce(
    (acc, item) => {
      acc[item.earnType].push(item);
      return acc;
    },
    {
      routine: [],
      task: [],
      growth_pick: [],
      training_path: [],
      bonus: [],
    } as Record<EarnType, EarnItem[]>,
  );
}
