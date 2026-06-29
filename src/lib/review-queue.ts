import { db } from "@/lib/db";
import type { ChallengeIntervalType, ChallengeProgressStatus, TaskProofType, TaskStatus } from "@/generated/prisma/client";

export type ReviewQueueTaskItem = {
  kind: "task";
  id: string;
  title: string;
  status: TaskStatus;
  proofType: TaskProofType;
  reflection: string | null;
  submittedAt: Date | null;
  cub: { id: string; displayName: string } | null;
  focusActivityCardId: string | null;
  trainingDeckId: string | null;
  trainingDeckTitle: string | null;
};

export type ReviewQueueRoutineItem = {
  kind: "routine";
  log: {
    id: string;
    reflection: string | null;
    submittedAt: Date | null;
    status: ChallengeProgressStatus;
    challenge: {
      title: string;
      intervalType: ChallengeIntervalType;
      intervalConfig: unknown;
    };
    cub: { id: string; displayName: string };
  };
};

export type ReviewQueueGrowthPickItem = {
  kind: "growth_pick";
  completion: {
    id: string;
    reflection: string | null;
    submittedAt: Date | null;
    card: {
      title: string;
      categoryPoints: unknown;
    };
    cub: { id: string; displayName: string };
  };
};

export type ReviewQueueItem =
  | ReviewQueueTaskItem
  | ReviewQueueRoutineItem
  | ReviewQueueGrowthPickItem;

export async function getReviewQueueItems(
  familyId: string,
): Promise<ReviewQueueItem[]> {
  const [tasks, challengeLogs, focusCompletions, trainingDecks] =
    await Promise.all([
      db.task.findMany({
        where: { familyId, status: "SUBMITTED" },
        include: { cub: true },
        orderBy: { submittedAt: "asc" },
      }),
      db.challengeProgressLog.findMany({
        where: { familyId, status: "SUBMITTED" },
        include: {
          cub: true,
          challenge: {
            select: {
              title: true,
              intervalType: true,
              intervalConfig: true,
            },
          },
        },
        orderBy: { submittedAt: "asc" },
      }),
      db.focusActivityCompletion.findMany({
        where: { familyId, status: "SUBMITTED" },
        include: {
          cub: true,
          card: { select: { title: true, categoryPoints: true } },
        },
        orderBy: { submittedAt: "asc" },
      }),
      db.trainingDeck.findMany({
        where: { familyId },
        select: { id: true, title: true },
      }),
    ]);

  const deckTitleById = new Map(
    trainingDecks.map((deck) => [deck.id, deck.title]),
  );

  return [
    ...tasks.map((task) => ({
      kind: "task" as const,
      id: task.id,
      title: task.title,
      status: task.status,
      proofType: task.proofType,
      reflection: task.reflection,
      submittedAt: task.submittedAt,
      cub: task.cub,
      focusActivityCardId: task.focusActivityCardId,
      trainingDeckId: task.trainingDeckId,
      trainingDeckTitle: task.trainingDeckId
        ? (deckTitleById.get(task.trainingDeckId) ?? null)
        : null,
    })),
    ...challengeLogs.map((log) => ({
      kind: "routine" as const,
      log,
    })),
    ...focusCompletions.map((completion) => ({
      kind: "growth_pick" as const,
      completion,
    })),
  ];
}
