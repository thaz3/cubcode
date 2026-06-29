"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@/generated/prisma/client";
import type { ActionState } from "@/lib/actions/auth";
import { requireCubForUser } from "@/lib/cub-access";
import { getWeekStart } from "@/lib/council-day";
import { db } from "@/lib/db";
import { creditApprovedFocusDeckRewards } from "@/lib/focus-deck-rewards";
import { getCardChecklistItems } from "@/lib/focus-deck-card";
import { ensureFocusDeckStarterCards } from "@/lib/focus-deck-seed";
import { assertFocusCompletionTransition } from "@/lib/focus-deck-transitions";
import {
  categoryPointsFromForm,
  parseFocusDeckCategoryPoints,
} from "@/lib/focus-deck-categories";
import { requireFamilyForUser, requireUserId } from "@/lib/session";
import {
  parseChecklistFromForm,
  validateSubmissionProof,
} from "@/lib/tasks";
import {
  focusActivityCardIdSchema,
  focusActivityCardSchema,
  focusActivityCompletionIdSchema,
  focusDeckStackSchema,
  reviewFocusCompletionSchema,
  submitFocusCompletionSchema,
  validateFocusActivityCardDefinition,
} from "@/lib/validations/focus-deck";

function revalidateFocusDeckPaths(cubId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/focus-deck");
  revalidatePath("/dashboard/tasks");
  if (cubId) {
    revalidatePath(`/cub/${cubId}`);
    revalidatePath(`/cub/${cubId}/focus-deck`);
    revalidatePath(`/cub/${cubId}/progress`);
  }
}

function parseFocusCardFormData(formData: FormData) {
  const parsed = focusActivityCardSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    instructions: formData.get("instructions") || undefined,
    estimatedMinutes: formData.get("estimatedMinutes") || undefined,
    locationType: formData.get("locationType") || undefined,
    difficulty: formData.get("difficulty") || undefined,
    proofType: formData.get("proofType"),
    proofPrompt: formData.get("proofPrompt") || undefined,
    proofChecklistItems: formData.get("proofChecklistItems") || undefined,
    xpEarned: formData.get("xpEarned"),
    focusTokensEarned: formData.get("focusTokensEarned"),
    phoneMinutesEarned: formData.get("phoneMinutesEarned"),
    focusMinutesEarned: formData.get("focusMinutesEarned"),
    publish: formData.get("publish")?.toString(),
  });

  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const categoryPoints = categoryPointsFromForm(formData);
  const validationError = validateFocusActivityCardDefinition(
    parsed.data,
    categoryPoints,
  );
  if (validationError) {
    return { ok: false as const, error: validationError };
  }

  return { ok: true as const, data: parsed.data, categoryPoints };
}

function cardDataFromParsed(
  data: NonNullable<ReturnType<typeof parseFocusCardFormData>["data"]>,
  categoryPoints: Prisma.InputJsonValue,
  familyId: string,
  userId: string,
  status: "DRAFT" | "ACTIVE",
) {
  return {
    familyId,
    createdByUserId: userId,
    title: data.title,
    description: data.description ?? null,
    instructions: data.instructions ?? null,
    estimatedMinutes: data.estimatedMinutes ?? null,
    locationType: data.locationType ?? null,
    difficulty: data.difficulty ?? null,
    categoryPoints,
    proofType: data.proofType,
    proofPrompt: data.proofPrompt || null,
    proofChecklistItems: data.proofChecklistItems ?? undefined,
    xpEarned: data.xpEarned,
    focusTokensEarned: data.focusTokensEarned,
    phoneMinutesEarned: data.phoneMinutesEarned,
    focusMinutesEarned: data.focusMinutesEarned,
    status,
  };
}

export async function ensureFamilyFocusDeckStarterCards(familyId: string, userId: string) {
  await ensureFocusDeckStarterCards(familyId, userId);
}

export async function createFocusActivityCardAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);
  await ensureFocusDeckStarterCards(family.id, userId);

  const parsed = parseFocusCardFormData(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  const status = parsed.data.publish === "true" ? "ACTIVE" : "DRAFT";

  const card = await db.focusActivityCard.create({
    data: cardDataFromParsed(
      parsed.data,
      parsed.categoryPoints as Prisma.InputJsonValue,
      family.id,
      userId,
      status,
    ),
  });

  revalidateFocusDeckPaths();
  return { success: `Focus card “${card.title}” saved.` };
}

export async function updateFocusActivityCardAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const idParsed = focusActivityCardIdSchema.safeParse({
    cardId: formData.get("cardId"),
  });
  if (!idParsed.success) {
    return { error: "Invalid card." };
  }

  const card = await db.focusActivityCard.findFirst({
    where: { id: idParsed.data.cardId, familyId: family.id },
  });
  if (!card) {
    return { error: "Focus card not found." };
  }
  if (card.status === "ARCHIVED") {
    return { error: "Archived cards cannot be edited." };
  }

  const parsed = parseFocusCardFormData(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  const status =
    parsed.data.publish === "true"
      ? "ACTIVE"
      : card.status === "ACTIVE"
        ? "ACTIVE"
        : "DRAFT";

  await db.focusActivityCard.update({
    where: { id: card.id },
    data: cardDataFromParsed(
      parsed.data,
      parsed.categoryPoints as Prisma.InputJsonValue,
      family.id,
      userId,
      status,
    ),
  });

  revalidateFocusDeckPaths();
  return { success: `Focus card “${parsed.data.title}” updated.` };
}

export async function archiveFocusActivityCardFormAction(
  formData: FormData,
): Promise<void> {
  const cardId = formData.get("cardId")?.toString();
  if (!cardId) return;
  await archiveFocusActivityCardAction(cardId);
}

export async function removeCardFromWeeklyStackFormAction(
  formData: FormData,
): Promise<void> {
  const stackItemId = formData.get("stackItemId")?.toString();
  if (!stackItemId) return;
  await removeCardFromWeeklyStackAction(stackItemId);
}

export async function pickFocusCardFormAction(formData: FormData): Promise<void> {
  await pickFocusCardAction({} as ActionState, formData);
}

export async function addCardToWeeklyStackFormAction(formData: FormData): Promise<void> {
  await addCardToWeeklyStackAction({} as ActionState, formData);
}

export async function archiveFocusActivityCardAction(
  cardId: string,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const card = await db.focusActivityCard.findFirst({
    where: { id: cardId, familyId: family.id },
  });
  if (!card) {
    return { error: "Focus card not found." };
  }

  await db.focusActivityCard.update({
    where: { id: card.id },
    data: { status: "ARCHIVED" },
  });

  revalidateFocusDeckPaths();
  return { success: "Focus card archived." };
}

export async function addCardToWeeklyStackAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);
  const weekStartsOn = getWeekStart();

  const parsed = focusDeckStackSchema.safeParse({
    cardId: formData.get("cardId"),
    cubId: formData.get("cubId"),
  });
  if (!parsed.success) {
    return { error: "Invalid stack request." };
  }

  const cub = family.cubs.find((c) => c.id === parsed.data.cubId);
  if (!cub) {
    return { error: "Cub not found." };
  }

  const card = await db.focusActivityCard.findFirst({
    where: {
      id: parsed.data.cardId,
      familyId: family.id,
      status: "ACTIVE",
    },
  });
  if (!card) {
    return { error: "Active focus card not found." };
  }

  await db.focusDeckStackItem.upsert({
    where: {
      cubId_cardId_weekStartsOn: {
        cubId: cub.id,
        cardId: card.id,
        weekStartsOn,
      },
    },
    create: {
      familyId: family.id,
      cubId: cub.id,
      cardId: card.id,
      weekStartsOn,
    },
    update: {},
  });

  revalidateFocusDeckPaths(cub.id);
  return { success: `Added “${card.title}” to ${cub.displayName}'s deck this week.` };
}

export async function removeCardFromWeeklyStackAction(
  stackItemId: string,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const item = await db.focusDeckStackItem.findFirst({
    where: { id: stackItemId, familyId: family.id },
  });
  if (!item) {
    return { error: "Stack item not found." };
  }

  await db.focusDeckStackItem.delete({ where: { id: item.id } });
  revalidateFocusDeckPaths(item.cubId);
  return { success: "Removed from this week's deck." };
}

export async function pickFocusCardAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const cubId = formData.get("cubId")?.toString();
  const cardId = formData.get("cardId")?.toString();
  if (!cubId || !cardId) {
    return { error: "Invalid pick request." };
  }

  const userId = await requireUserId();
  const { familyId } = await requireCubForUser(cubId, userId);
  const weekStartsOn = getWeekStart();

  const stackItem = await db.focusDeckStackItem.findFirst({
    where: { cubId, cardId, weekStartsOn, familyId },
    include: { card: true },
  });
  if (!stackItem || stackItem.card.status !== "ACTIVE") {
    return { error: "This card is not on your deck this week." };
  }

  const existing = await db.focusActivityCompletion.findFirst({
    where: {
      cubId,
      cardId,
      weekStartsOn,
      status: { in: ["IN_PROGRESS", "SUBMITTED", "SENT_BACK"] },
    },
  });
  if (existing) {
    return { error: "You already have this card in progress." };
  }

  const rewarded = await db.focusActivityCompletion.findFirst({
    where: { cubId, cardId, weekStartsOn, status: "REWARDED" },
  });
  if (rewarded) {
    return { error: "You already finished this card this week." };
  }

  await db.focusActivityCompletion.create({
    data: {
      familyId,
      cubId,
      cardId,
      weekStartsOn,
      status: "IN_PROGRESS",
    },
  });

  revalidateFocusDeckPaths(cubId);
  return { success: `Started “${stackItem.card.title}”.` };
}

export async function submitFocusCompletionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();

  const parsed = submitFocusCompletionSchema.safeParse({
    completionId: formData.get("completionId"),
    reflection: formData.get("reflection")?.toString() || undefined,
    proofLink: formData.get("proofLink")?.toString() || undefined,
    timeLoggedMinutes: formData.get("timeLoggedMinutes") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const completion = await db.focusActivityCompletion.findUnique({
    where: { id: parsed.data.completionId },
    include: { card: true },
  });
  if (!completion) {
    return { error: "Focus activity not found." };
  }

  await requireCubForUser(completion.cubId, userId);

  if (completion.status !== "IN_PROGRESS" && completion.status !== "SENT_BACK") {
    return { error: "This activity cannot be submitted right now." };
  }

  const checklistData = parseChecklistFromForm(
    formData,
    getCardChecklistItems(completion.card),
  );
  const proofError = validateSubmissionProof(
    completion.card.proofType,
    {
      reflection: parsed.data.reflection,
      proofLink: parsed.data.proofLink,
      timeLoggedMinutes: parsed.data.timeLoggedMinutes,
      checklistData: checklistData ?? undefined,
    },
    getCardChecklistItems(completion.card),
  );
  if (proofError) {
    return { error: proofError };
  }

  assertFocusCompletionTransition(completion.status, "SUBMITTED");

  await db.focusActivityCompletion.update({
    where: { id: completion.id },
    data: {
      status: "SUBMITTED",
      reflection: parsed.data.reflection ?? null,
      proofLink: parsed.data.proofLink ?? null,
      checklistData: checklistData ?? undefined,
      submittedAt: new Date(),
    },
  });

  revalidateFocusDeckPaths(completion.cubId);
  return { success: "Submitted for parent review." };
}

export async function approveFocusCompletionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const parsed = reviewFocusCompletionSchema.safeParse({
    completionId: formData.get("completionId"),
    reviewNote: formData.get("reviewNote")?.toString() || undefined,
  });
  if (!parsed.success) {
    return { error: "Invalid review request." };
  }

  const completion = await db.focusActivityCompletion.findFirst({
    where: { id: parsed.data.completionId, familyId: family.id },
    include: { card: true, cub: true },
  });
  if (!completion) {
    return { error: "Submission not found." };
  }

  assertFocusCompletionTransition(completion.status, "REWARDED");

  await db.$transaction(async (tx) => {
    await tx.focusActivityCompletion.update({
      where: { id: completion.id },
      data: {
        status: "REWARDED",
        reviewNote: parsed.data.reviewNote ?? null,
        reviewedAt: new Date(),
        reviewedByUserId: userId,
      },
    });

    await creditApprovedFocusDeckRewards(
      completion,
      completion.card,
      completion.cub,
      userId,
      tx,
    );
  });

  revalidateFocusDeckPaths(completion.cubId);
  return { success: "Focus card approved and rewards credited." };
}

export async function rejectFocusCompletionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const parsed = reviewFocusCompletionSchema.safeParse({
    completionId: formData.get("completionId"),
    reviewNote: formData.get("reviewNote")?.toString() || undefined,
  });
  if (!parsed.success) {
    return { error: "Invalid review request." };
  }

  if (!parsed.data.reviewNote?.trim()) {
    return { error: "Add a note explaining the rejection." };
  }

  const completion = await db.focusActivityCompletion.findFirst({
    where: { id: parsed.data.completionId, familyId: family.id },
  });
  if (!completion) {
    return { error: "Submission not found." };
  }

  assertFocusCompletionTransition(completion.status, "REJECTED");

  await db.focusActivityCompletion.update({
    where: { id: completion.id },
    data: {
      status: "REJECTED",
      reviewNote: parsed.data.reviewNote,
      reviewedAt: new Date(),
      reviewedByUserId: userId,
    },
  });

  revalidateFocusDeckPaths(completion.cubId);
  return { success: "Focus card rejected." };
}

export async function sendBackFocusCompletionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const parsed = reviewFocusCompletionSchema.safeParse({
    completionId: formData.get("completionId"),
    reviewNote: formData.get("reviewNote")?.toString() || undefined,
  });
  if (!parsed.success) {
    return { error: "Invalid review request." };
  }

  if (!parsed.data.reviewNote?.trim()) {
    return { error: "Add a note so your Cub knows what to fix." };
  }

  const completion = await db.focusActivityCompletion.findFirst({
    where: { id: parsed.data.completionId, familyId: family.id },
  });
  if (!completion) {
    return { error: "Submission not found." };
  }

  assertFocusCompletionTransition(completion.status, "SENT_BACK");

  await db.focusActivityCompletion.update({
    where: { id: completion.id },
    data: {
      status: "SENT_BACK",
      reviewNote: parsed.data.reviewNote,
      reviewedAt: new Date(),
      reviewedByUserId: userId,
    },
  });

  revalidateFocusDeckPaths(completion.cubId);
  return { success: "Sent back for revision." };
}
