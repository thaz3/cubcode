import type { Task, TaskStatus } from "@/generated/prisma/client";

export type TrainingDeckBoardStatus =
  | "LOCKED"
  | "UNLOCKED"
  | "IN_PROGRESS"
  | "COMPLETE";

export type TrainingCardBoardStatus =
  | "NOT_STARTED"
  | "ASSIGNED"
  | "SUBMITTED"
  | "APPROVED"
  | "NEEDS_WORK";

const APPROVED_TASK_STATUSES: TaskStatus[] = ["APPROVED", "COMPLETED"];
const ACTIVE_TASK_STATUSES: TaskStatus[] = [
  "CLAIMED",
  "IN_PROGRESS",
  "SUBMITTED",
  "SENT_BACK",
];

export function isTrainingCardTaskApproved(status: TaskStatus): boolean {
  return APPROVED_TASK_STATUSES.includes(status);
}

export function getTrainingCardStatusFromTask(
  task: Pick<Task, "status"> | null | undefined,
): TrainingCardBoardStatus {
  if (!task) return "NOT_STARTED";
  if (APPROVED_TASK_STATUSES.includes(task.status)) return "APPROVED";
  if (task.status === "SUBMITTED") return "SUBMITTED";
  if (task.status === "REJECTED" || task.status === "SENT_BACK") {
    return "NEEDS_WORK";
  }
  if (ACTIVE_TASK_STATUSES.includes(task.status)) return "ASSIGNED";
  return "NOT_STARTED";
}

type DeckWithCards = {
  id: string;
  milestoneNumber: number;
  cards: Array<{ id: string }>;
};

export function countApprovedCardsForDeck(
  deck: DeckWithCards,
  tasksByCardId: Map<string, Pick<Task, "status">>,
): number {
  return deck.cards.filter((card) => {
    const task = tasksByCardId.get(card.id);
    return task && isTrainingCardTaskApproved(task.status);
  }).length;
}

export function isTrainingDeckComplete(
  deck: DeckWithCards,
  tasksByCardId: Map<string, Pick<Task, "status">>,
): boolean {
  if (deck.cards.length === 0) return false;
  return countApprovedCardsForDeck(deck, tasksByCardId) === deck.cards.length;
}

export function getTrainingDeckBoardStatus(
  deck: DeckWithCards,
  decks: DeckWithCards[],
  tasksByCardId: Map<string, Pick<Task, "status">>,
): TrainingDeckBoardStatus {
  const deckIndex = decks.findIndex((d) => d.id === deck.id);
  const previous = deckIndex > 0 ? decks[deckIndex - 1] : null;

  if (previous && !isTrainingDeckComplete(previous, tasksByCardId)) {
    return "LOCKED";
  }

  if (isTrainingDeckComplete(deck, tasksByCardId)) {
    return "COMPLETE";
  }

  const approved = countApprovedCardsForDeck(deck, tasksByCardId);
  const hasActive = deck.cards.some((card) => {
    const task = tasksByCardId.get(card.id);
    return task && ACTIVE_TASK_STATUSES.includes(task.status);
  });

  if (approved > 0 || hasActive) {
    return "IN_PROGRESS";
  }

  return "UNLOCKED";
}

export function buildLatestTasksByCardId(
  tasks: Array<Pick<Task, "id" | "status" | "focusActivityCardId" | "updatedAt">>,
): Map<string, Pick<Task, "id" | "status">> {
  const map = new Map<string, Pick<Task, "id" | "status">>();

  const sorted = [...tasks].sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
  );

  for (const task of sorted) {
    if (!task.focusActivityCardId) continue;
    if (map.has(task.focusActivityCardId)) continue;
    if (task.status === "AVAILABLE" || task.status === "REJECTED") continue;
    map.set(task.focusActivityCardId, { id: task.id, status: task.status });
  }

  return map;
}

export function getDeckCta(
  status: TrainingDeckBoardStatus,
): { label: string; disabled: boolean } {
  switch (status) {
    case "LOCKED":
      return { label: "Locked", disabled: true };
    case "UNLOCKED":
      return { label: "Start Deck", disabled: false };
    case "IN_PROGRESS":
      return { label: "Continue", disabled: false };
    case "COMPLETE":
      return { label: "Review Deck", disabled: false };
  }
}

export function getCardCta(
  status: TrainingCardBoardStatus,
  taskId: string | null,
): { label: string; href: string | null; canAssign: boolean } {
  switch (status) {
    case "NOT_STARTED":
      return { label: "Assign", href: null, canAssign: true };
    case "ASSIGNED":
    case "SUBMITTED":
    case "NEEDS_WORK":
      return {
        label: "View Assignment",
        href: taskId ? `/dashboard/tasks/${taskId}` : null,
        canAssign: false,
      };
    case "APPROVED":
      return {
        label: "View Assignment",
        href: taskId ? `/dashboard/tasks/${taskId}` : null,
        canAssign: false,
      };
  }
}

export const TRAINING_CARD_STATUS_LABELS: Record<TrainingCardBoardStatus, string> = {
  NOT_STARTED: "Not Started",
  ASSIGNED: "Assigned",
  SUBMITTED: "Submitted",
  APPROVED: "Approved",
  NEEDS_WORK: "Needs Work",
};

export const TRAINING_DECK_STATUS_LABELS: Record<TrainingDeckBoardStatus, string> = {
  LOCKED: "Locked",
  UNLOCKED: "Unlocked",
  IN_PROGRESS: "In Progress",
  COMPLETE: "Complete",
};
