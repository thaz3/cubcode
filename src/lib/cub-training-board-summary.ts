import { db } from "@/lib/db";
import type { TrainingDeckBoardStatus } from "@/lib/training-board-progress";
import {
  buildLatestTasksByCardId,
  countApprovedCardsForDeck,
  getTrainingCardStatusFromTask,
  getTrainingDeckBoardStatus,
  TRAINING_CARD_STATUS_LABELS,
  type TrainingCardBoardStatus,
} from "@/lib/training-board-progress";
import {
  ensureTrainingBoardSeeded,
  getTrainingDecksForFamily,
} from "@/lib/training-deck-seed";

export type CubTrainingMilestoneSummary = {
  slug: string;
  milestoneNumber: number;
  title: string;
  description: string;
  status: TrainingDeckBoardStatus;
  approvedCount: number;
  totalCards: number;
};

export type CubTrainingBoardSummary = {
  milestones: CubTrainingMilestoneSummary[];
  completedDecks: number;
  totalDecks: number;
  totalCardsApproved: number;
  totalCards: number;
  activeMilestone: CubTrainingMilestoneSummary | null;
};

export type FamilyCubTrainingProgress = CubTrainingBoardSummary & {
  cubId: string;
  displayName: string;
};

function buildCubTrainingBoardSummary(
  decks: Awaited<ReturnType<typeof getTrainingDecksForFamily>>,
  tasksByCardId: ReturnType<typeof buildLatestTasksByCardId>,
): CubTrainingBoardSummary {
  const milestones = decks.map((deck) => ({
    slug: deck.slug,
    milestoneNumber: deck.milestoneNumber,
    title: deck.title,
    description: deck.description ?? "",
    status: getTrainingDeckBoardStatus(deck, decks, tasksByCardId),
    approvedCount: countApprovedCardsForDeck(deck, tasksByCardId),
    totalCards: deck.cards.length,
  }));

  const completedDecks = milestones.filter((m) => m.status === "COMPLETE").length;
  const totalCardsApproved = milestones.reduce((sum, m) => sum + m.approvedCount, 0);
  const totalCards = milestones.reduce((sum, m) => sum + m.totalCards, 0);
  const activeMilestone =
    milestones.find((m) => m.status === "IN_PROGRESS") ??
    milestones.find((m) => m.status === "UNLOCKED") ??
    null;

  return {
    milestones,
    completedDecks,
    totalDecks: milestones.length,
    totalCardsApproved,
    totalCards,
    activeMilestone,
  };
}

export type CubTrainingPathAssignment = {
  taskId: string;
  title: string;
  deckTitle: string;
  deckSlug: string;
  milestoneNumber: number;
  boardStatus: TrainingCardBoardStatus;
  statusLabel: string;
};

const TRAINING_ASSIGNMENT_STATUS_PRIORITY: Record<TrainingCardBoardStatus, number> = {
  NEEDS_WORK: 0,
  ASSIGNED: 1,
  SUBMITTED: 2,
  NOT_STARTED: 3,
  APPROVED: 4,
};

export async function getCubTrainingPathAssignments(
  familyId: string,
  cubId: string,
): Promise<{
  assignments: CubTrainingPathAssignment[];
  summary: CubTrainingBoardSummary;
}> {
  await ensureTrainingBoardSeeded(familyId);

  const [summary, tasks, decks] = await Promise.all([
    getCubTrainingBoardSummary(familyId, cubId),
    db.task.findMany({
      where: {
        familyId,
        cubId,
        focusActivityCardId: { not: null },
        trainingDeckId: { not: null },
        status: { in: ["CLAIMED", "IN_PROGRESS", "SUBMITTED", "SENT_BACK"] },
      },
      select: {
        id: true,
        title: true,
        status: true,
        focusActivityCardId: true,
        trainingDeckId: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
    getTrainingDecksForFamily(familyId),
  ]);

  const tasksByCardId = buildLatestTasksByCardId(tasks);
  const taskMeta = new Map(tasks.map((task) => [task.id, task]));
  const deckById = new Map(decks.map((deck) => [deck.id, deck]));

  const assignments: CubTrainingPathAssignment[] = [];

  for (const task of tasksByCardId.values()) {
    const meta = taskMeta.get(task.id);
    if (!meta?.trainingDeckId) continue;

    const deck = deckById.get(meta.trainingDeckId);
    if (!deck) continue;

    const boardStatus = getTrainingCardStatusFromTask(task);

    assignments.push({
      taskId: task.id,
      title: meta.title,
      deckTitle: deck.title,
      deckSlug: deck.slug,
      milestoneNumber: deck.milestoneNumber,
      boardStatus,
      statusLabel: TRAINING_CARD_STATUS_LABELS[boardStatus],
    });
  }

  assignments.sort(
    (a, b) =>
      TRAINING_ASSIGNMENT_STATUS_PRIORITY[a.boardStatus] -
      TRAINING_ASSIGNMENT_STATUS_PRIORITY[b.boardStatus],
  );

  return { assignments, summary };
}

export async function getCubTrainingBoardSummary(
  familyId: string,
  cubId: string,
): Promise<CubTrainingBoardSummary> {
  await ensureTrainingBoardSeeded(familyId);

  const decks = await getTrainingDecksForFamily(familyId);

  const cubTasks = await db.task.findMany({
    where: {
      familyId,
      cubId,
      focusActivityCardId: { not: null },
    },
    select: {
      id: true,
      status: true,
      focusActivityCardId: true,
      updatedAt: true,
    },
  });

  const tasksByCardId = buildLatestTasksByCardId(cubTasks);
  return buildCubTrainingBoardSummary(decks, tasksByCardId);
}

export async function getFamilyTrainingBoardSummaries(
  familyId: string,
  cubs: Array<{ id: string; displayName: string }>,
): Promise<FamilyCubTrainingProgress[]> {
  if (cubs.length === 0) return [];

  await ensureTrainingBoardSeeded(familyId);

  const decks = await getTrainingDecksForFamily(familyId);
  const cubIds = cubs.map((cub) => cub.id);

  const allTasks = await db.task.findMany({
    where: {
      familyId,
      cubId: { in: cubIds },
      focusActivityCardId: { not: null },
    },
    select: {
      id: true,
      cubId: true,
      status: true,
      focusActivityCardId: true,
      updatedAt: true,
    },
  });

  return cubs.map((cub) => {
    const cubTasks = allTasks.filter((task) => task.cubId === cub.id);
    const tasksByCardId = buildLatestTasksByCardId(cubTasks);

    return {
      cubId: cub.id,
      displayName: cub.displayName,
      ...buildCubTrainingBoardSummary(decks, tasksByCardId),
    };
  });
}
