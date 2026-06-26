import { db } from "@/lib/db";
import type { TrainingDeckBoardStatus } from "@/lib/training-board-progress";
import {
  buildLatestTasksByCardId,
  countApprovedCardsForDeck,
  getTrainingDeckBoardStatus,
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
