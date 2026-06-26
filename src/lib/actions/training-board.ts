"use server";

import { revalidatePath } from "next/cache";
import type { TaskCategory } from "@/generated/prisma/client";
import type { ActionState } from "@/lib/actions/auth";
import { db } from "@/lib/db";
import { getDueFieldsFromFormData } from "@/lib/due-date-fields";
import { requireFamilyForUser, requireUserId } from "@/lib/session";
import {
  buildLatestTasksByCardId,
  getTrainingDeckBoardStatus,
  isTrainingCardTaskApproved,
  isTrainingDeckComplete,
} from "@/lib/training-board-progress";
import { syncGuardianNudgesForFamily } from "@/lib/guardian-nudges/sync";
import { resolveRecurrenceScheduleFromForm } from "@/lib/task-recurrence";

function taskCategoryForDeckSlug(slug: string): TaskCategory {
  if (slug === "get-some-sun") return "SUMMER_LITE";
  if (slug === "know-your-roots") return "LEGACY_WEEKLY";
  return "ATTITUDE";
}

function revalidateTrainingBoardPaths(cubId?: string | null, deckSlug?: string) {
  revalidatePath("/dashboard/tasks/templates");
  if (deckSlug) {
    revalidatePath(`/dashboard/tasks/templates/deck/${deckSlug}`);
  }
  revalidatePath("/dashboard/tasks");
  if (cubId) {
    revalidatePath(`/dashboard/cubs/${cubId}/tasks`);
    revalidatePath(`/cub/${cubId}/tasks`);
    revalidatePath(`/cub/${cubId}/training`);
    revalidatePath(`/cub/${cubId}/progress`);
    if (deckSlug) {
      revalidatePath(`/cub/${cubId}/training/deck/${deckSlug}`);
    }
  }
}

export async function assignFocusCardAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const cardId = formData.get("cardId")?.toString();
  const cubId = formData.get("cubId")?.toString();

  if (!cardId || !cubId) {
    return { error: "Choose a Cub to assign this card." };
  }

  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);
  const cub = family.cubs.find((c) => c.id === cubId);
  if (!cub) {
    return { error: "Cub not found." };
  }

  const card = await db.focusActivityCard.findFirst({
    where: {
      id: cardId,
      familyId: family.id,
      status: "ACTIVE",
      trainingDeckId: { not: null },
    },
    include: {
      trainingDeck: {
        include: {
          cards: { where: { status: "ACTIVE" }, select: { id: true } },
        },
      },
    },
  });

  if (!card?.trainingDeck) {
    return { error: "Focus card not found." };
  }

  const decks = await db.trainingDeck.findMany({
    where: { familyId: family.id },
    orderBy: { sortOrder: "asc" },
    include: {
      cards: { where: { status: "ACTIVE" }, select: { id: true } },
    },
  });

  const cubTasks = await db.task.findMany({
    where: {
      familyId: family.id,
      cubId: cub.id,
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
  const deckStatus = getTrainingDeckBoardStatus(
    card.trainingDeck,
    decks,
    tasksByCardId,
  );

  if (deckStatus === "LOCKED") {
    return { error: "Complete the previous milestone deck to unlock this card." };
  }

  const existing = tasksByCardId.get(card.id);
  if (existing && !isTrainingCardTaskApproved(existing.status)) {
    return { error: "This card already has an active assignment." };
  }
  if (existing && isTrainingCardTaskApproved(existing.status)) {
    return { error: "This card is already complete for this Cub." };
  }

  const dueFields = getDueFieldsFromFormData(formData);
  const schedule = resolveRecurrenceScheduleFromForm(formData);

  await db.task.create({
    data: {
      familyId: family.id,
      cubId: cub.id,
      status: "CLAIMED",
      claimedAt: new Date(),
      focusActivityCardId: card.id,
      trainingDeckId: card.trainingDeckId,
      title: card.title,
      description: card.instructions ?? card.description,
      category: taskCategoryForDeckSlug(card.trainingDeck.slug),
      proofType: card.proofType,
      proofPrompt: card.proofPrompt,
      proofChecklistItems: card.proofChecklistItems ?? undefined,
      focusMinutesEarned: card.focusMinutesEarned,
      phoneMinutesEarned: card.phoneMinutesEarned,
      xpEarned: card.xpEarned,
      focusTokensEarned: card.focusTokensEarned,
      dueAt: dueFields?.dueAt ?? schedule.dueAt ?? null,
      dueAtHasTime: schedule.dueAtHasTime,
      recurrence: schedule.recurrence,
      recurrenceConfig: schedule.recurrenceConfig ?? undefined,
    },
  });

  await syncGuardianNudgesForFamily(family.id);
  revalidateTrainingBoardPaths(cub.id, card.trainingDeck.slug);
  return { success: `Assigned to ${cub.displayName}.` };
}

export async function assignFocusCardFormAction(formData: FormData): Promise<void> {
  await assignFocusCardAction({} as ActionState, formData);
}

export async function revalidateTrainingBoardAfterTaskReview(
  familyId: string,
  task: {
    cubId: string | null;
    focusActivityCardId: string | null;
    trainingDeckId: string | null;
    status: string;
  },
) {
  if (!task.focusActivityCardId || !task.trainingDeckId || !task.cubId) {
    return;
  }

  if (!isTrainingCardTaskApproved(task.status as "APPROVED" | "COMPLETED")) {
    revalidateTrainingBoardPaths(task.cubId);
    return;
  }

  const deck = await db.trainingDeck.findFirst({
    where: { id: task.trainingDeckId, familyId },
    include: {
      cards: { where: { status: "ACTIVE" }, select: { id: true } },
    },
  });

  if (!deck) return;

  const cubTasks = await db.task.findMany({
    where: {
      familyId,
      cubId: task.cubId,
      trainingDeckId: deck.id,
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
  const deckComplete = isTrainingDeckComplete(deck, tasksByCardId);

  revalidateTrainingBoardPaths(task.cubId, deck.slug);

  if (deckComplete) {
    const nextDeck = await db.trainingDeck.findFirst({
      where: { familyId, sortOrder: { gt: deck.sortOrder } },
      orderBy: { sortOrder: "asc" },
    });
    if (nextDeck) {
      revalidateTrainingBoardPaths(task.cubId, nextDeck.slug);
    }
  }
}
