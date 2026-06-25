"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { requireFamilyForUser, requireUserId } from "@/lib/session";
import { requireCubForUser } from "@/lib/cub-access";
import { parseCustomDaysFromForm } from "@/lib/challenge-intervals";
import {
  challengeHasMeaningfulProgress,
  getOrCreateCurrentProgressLog,
} from "@/lib/challenges";
import { getChallengeChecklistItems } from "@/lib/challenge-checklist";
import { creditApprovedChallengeRewards } from "@/lib/challenge-rewards";
import { assertChallengeTransition } from "@/lib/challenge-transitions";
import {
  challengeIdSchema,
  challengeProgressLogIdSchema,
  challengeSchema,
  reviewChallengeProgressSchema,
  submitChallengeCheckInSchema,
  validateChallengeDefinition,
} from "@/lib/validations/challenge";
import {
  parseChecklistFromForm,
  validateSubmissionProof,
} from "@/lib/tasks";
import type { ActionState } from "@/lib/actions/auth";

function revalidateChallengePaths(cubId: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/challenges");
  revalidatePath("/dashboard/tasks/review");
  revalidatePath(`/cub/${cubId}`);
  revalidatePath(`/cub/${cubId}/challenges`);
}

function parseChallengeFormData(formData: FormData) {
  const customDays = parseCustomDaysFromForm(formData);
  return challengeSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    cubId: formData.get("cubId"),
    intervalType: formData.get("intervalType"),
    customDays: customDays.length > 0 ? customDays : undefined,
    proofType: formData.get("proofType"),
    proofPrompt: formData.get("proofPrompt") || undefined,
    proofChecklistItems: formData.get("proofChecklistItems") || undefined,
    xpEarned: formData.get("xpEarned"),
    focusTokensEarned: formData.get("focusTokensEarned"),
    phoneMinutesEarned: formData.get("phoneMinutesEarned"),
    growthCategory: formData.get("growthCategory") || undefined,
  });
}

function challengeDataFromParsed(
  data: Parameters<typeof validateChallengeDefinition>[0],
  userId: string,
  familyId: string,
) {
  const intervalConfig =
    data.intervalType === "CUSTOM" && data.customDays
      ? { daysOfWeek: data.customDays }
      : undefined;

  return {
    title: data.title,
    description: data.description ?? null,
    cubId: data.cubId,
    familyId,
    createdByUserId: userId,
    intervalType: data.intervalType,
    intervalConfig: intervalConfig as Prisma.InputJsonValue | undefined,
    proofType: data.proofType,
    proofPrompt: data.proofPrompt || null,
    proofChecklistItems: data.proofChecklistItems ?? undefined,
    growthCategory: data.growthCategory ?? null,
    xpEarned: data.xpEarned,
    focusTokensEarned: data.focusTokensEarned,
    phoneMinutesEarned: data.phoneMinutesEarned,
  };
}

export async function createChallengeAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const parsed = parseChallengeFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const validationError = validateChallengeDefinition(parsed.data);
  if (validationError) {
    return { error: validationError };
  }

  const cub = family.cubs.find((c) => c.id === parsed.data.cubId);
  if (!cub) {
    return { error: "Cub not found in your family." };
  }

  const challenge = await db.challenge.create({
    data: challengeDataFromParsed(parsed.data, userId, family.id),
  });

  revalidateChallengePaths(cub.id);
  return { success: `Routine challenge “${challenge.title}” created for ${cub.displayName}.` };
}

export async function updateChallengeAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const idParsed = challengeIdSchema.safeParse({
    challengeId: formData.get("challengeId"),
  });
  if (!idParsed.success) {
    return { error: "Invalid challenge." };
  }

  const challenge = await db.challenge.findFirst({
    where: { id: idParsed.data.challengeId, familyId: family.id },
  });
  if (!challenge) {
    return { error: "Challenge not found." };
  }
  if (challenge.status === "ARCHIVED") {
    return { error: "Archived challenges cannot be edited." };
  }

  const parsed = parseChallengeFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const validationError = validateChallengeDefinition(parsed.data);
  if (validationError) {
    return { error: validationError };
  }

  if (parsed.data.cubId !== challenge.cubId) {
    return { error: "Reassigning a challenge to another Cub is not supported yet." };
  }

  const data = challengeDataFromParsed(parsed.data, userId, family.id);
  await db.challenge.update({
    where: { id: challenge.id },
    data: {
      title: data.title,
      description: data.description,
      intervalType: data.intervalType,
      intervalConfig: data.intervalConfig,
      proofType: data.proofType,
      proofPrompt: data.proofPrompt,
      proofChecklistItems: data.proofChecklistItems,
      growthCategory: data.growthCategory,
      xpEarned: data.xpEarned,
      focusTokensEarned: data.focusTokensEarned,
      phoneMinutesEarned: data.phoneMinutesEarned,
    },
  });

  revalidateChallengePaths(challenge.cubId);
  revalidatePath(`/dashboard/challenges/${challenge.id}`);
  revalidatePath(`/dashboard/challenges/${challenge.id}/edit`);
  return { success: "Challenge updated." };
}

export async function pauseChallengeAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const parsed = challengeIdSchema.safeParse({
    challengeId: formData.get("challengeId"),
  });
  if (!parsed.success) {
    return { error: "Invalid challenge." };
  }

  const challenge = await db.challenge.findFirst({
    where: { id: parsed.data.challengeId, familyId: family.id },
  });
  if (!challenge) {
    return { error: "Challenge not found." };
  }

  await db.challenge.update({
    where: { id: challenge.id },
    data: { status: challenge.status === "PAUSED" ? "ACTIVE" : "PAUSED" },
  });

  revalidateChallengePaths(challenge.cubId);
  revalidatePath(`/dashboard/challenges/${challenge.id}`);
  return {
    success:
      challenge.status === "PAUSED"
        ? "Challenge resumed."
        : "Challenge paused. Your Cub will no longer see it for check-in.",
  };
}

export async function archiveChallengeAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const parsed = challengeIdSchema.safeParse({
    challengeId: formData.get("challengeId"),
  });
  if (!parsed.success) {
    return { error: "Invalid challenge." };
  }

  const challenge = await db.challenge.findFirst({
    where: { id: parsed.data.challengeId, familyId: family.id },
  });
  if (!challenge) {
    return { error: "Challenge not found." };
  }

  await db.challenge.update({
    where: { id: challenge.id },
    data: { status: "ARCHIVED" },
  });

  revalidateChallengePaths(challenge.cubId);
  return { success: "Challenge archived. History is preserved." };
}

export async function deleteChallengeAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const parsed = challengeIdSchema.safeParse({
    challengeId: formData.get("challengeId"),
  });
  if (!parsed.success) {
    return { error: "Invalid challenge." };
  }

  const challenge = await db.challenge.findFirst({
    where: { id: parsed.data.challengeId, familyId: family.id },
    include: { progressLogs: { select: { status: true } } },
  });
  if (!challenge) {
    return { error: "Challenge not found." };
  }

  if (challengeHasMeaningfulProgress(challenge.progressLogs)) {
    return {
      error:
        "This challenge has progress history. Archive it instead of deleting.",
    };
  }

  await db.challenge.delete({ where: { id: challenge.id } });
  revalidateChallengePaths(challenge.cubId);
  return { success: "Challenge deleted." };
}

export async function checkInChallengeAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const challengeId = formData.get("challengeId")?.toString();
  if (!challengeId) {
    return { error: "Invalid routine." };
  }

  const challenge = await db.challenge.findUnique({ where: { id: challengeId } });
  if (!challenge) {
    return { error: "Routine not found." };
  }

  await requireCubForUser(challenge.cubId, userId);

  if (challenge.status !== "ACTIVE") {
    return { error: "This routine is not active right now." };
  }

  const completed = formData.get("completed") === "on";
  if (!completed) {
    return { error: "Mark the routine as done before continuing." };
  }

  const log = await getOrCreateCurrentProgressLog(challenge);
  if (!log) {
    return { error: "This routine is not due today." };
  }

  if (log.status === "SUBMITTED" || log.status === "REWARDED") {
    return { error: "This interval was already submitted." };
  }

  await db.challengeProgressLog.update({
    where: { id: log.id },
    data: { completed: true },
  });

  revalidateChallengePaths(challenge.cubId);
  return { success: "Marked as done. Add proof and submit when ready." };
}

export async function submitChallengeCheckInAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();

  const parsed = submitChallengeCheckInSchema.safeParse({
    challengeId: formData.get("challengeId"),
    reflection: formData.get("reflection")?.toString() || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const challenge = await db.challenge.findUnique({
    where: { id: parsed.data.challengeId },
  });
  if (!challenge) {
    return { error: "Routine not found." };
  }

  await requireCubForUser(challenge.cubId, userId);

  if (challenge.status !== "ACTIVE") {
    return { error: "This routine is not active right now." };
  }

  const log = await getOrCreateCurrentProgressLog(challenge);
  if (!log) {
    return { error: "This routine is not due today." };
  }

  if (log.status === "SUBMITTED") {
    return { error: "Already submitted for parent review." };
  }
  if (log.status === "REWARDED") {
    return { error: "This interval was already approved." };
  }
  if (!log.completed) {
    return { error: "Mark the routine as done first." };
  }

  const checklistItems = getChallengeChecklistItems(challenge);
  const checklistData =
    challenge.proofType === "CHECKLIST"
      ? parseChecklistFromForm(formData, checklistItems)
      : undefined;

  const proofError = validateSubmissionProof(
    challenge.proofType,
    {
      reflection: parsed.data.reflection,
      checklistData,
    },
    checklistItems,
  );
  if (proofError) {
    return { error: proofError };
  }

  assertChallengeTransition(log.status, "SUBMITTED");

  await db.challengeProgressLog.update({
    where: { id: log.id },
    data: {
      status: "SUBMITTED",
      reflection: parsed.data.reflection ?? null,
      checklistData: checklistData ?? undefined,
      submittedAt: new Date(),
    },
  });

  revalidateChallengePaths(challenge.cubId);
  return { success: "Submitted for parent review!" };
}

export async function approveChallengeProgressAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const parsed = reviewChallengeProgressSchema.safeParse({
    logId: formData.get("logId"),
    reviewNote: formData.get("reviewNote")?.toString(),
  });
  if (!parsed.success) {
    return { error: "Invalid submission." };
  }

  const log = await db.challengeProgressLog.findFirst({
    where: { id: parsed.data.logId, familyId: family.id },
    include: { challenge: true, cub: true },
  });
  if (!log) {
    return { error: "Check-in not found." };
  }

  if (log.status !== "SUBMITTED") {
    return { error: "Only submitted check-ins can be approved." };
  }

  assertChallengeTransition(log.status, "REWARDED");

  await db.$transaction(async (tx) => {
    await creditApprovedChallengeRewards(
      log,
      log.challenge,
      log.cub,
      userId,
      tx,
    );

    await tx.challengeProgressLog.update({
      where: { id: log.id },
      data: {
        status: "REWARDED",
        reviewNote: parsed.data.reviewNote ?? null,
        reviewedAt: new Date(),
        reviewedByUserId: userId,
      },
    });
  });

  revalidateChallengePaths(log.cubId);
  revalidatePath(`/dashboard/challenges/review/${log.id}`);
  return { success: "Routine check-in approved and rewards credited." };
}

export async function rejectChallengeProgressAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const parsed = reviewChallengeProgressSchema.safeParse({
    logId: formData.get("logId"),
    reviewNote: formData.get("reviewNote")?.toString(),
  });
  if (!parsed.success) {
    return { error: "Invalid submission." };
  }

  if (!parsed.data.reviewNote?.trim()) {
    return { error: "Add a note when rejecting." };
  }

  const log = await db.challengeProgressLog.findFirst({
    where: { id: parsed.data.logId, familyId: family.id },
  });
  if (!log) {
    return { error: "Check-in not found." };
  }

  if (log.status !== "SUBMITTED") {
    return { error: "Only submitted check-ins can be rejected." };
  }

  assertChallengeTransition(log.status, "REJECTED");

  await db.challengeProgressLog.update({
    where: { id: log.id },
    data: {
      status: "REJECTED",
      reviewNote: parsed.data.reviewNote,
      reviewedAt: new Date(),
      reviewedByUserId: userId,
    },
  });

  revalidateChallengePaths(log.cubId);
  return { success: "Check-in rejected." };
}

export async function sendBackChallengeProgressAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const parsed = reviewChallengeProgressSchema.safeParse({
    logId: formData.get("logId"),
    reviewNote: formData.get("reviewNote")?.toString(),
  });
  if (!parsed.success) {
    return { error: "Invalid submission." };
  }

  if (!parsed.data.reviewNote?.trim()) {
    return { error: "Add a note when sending back." };
  }

  const log = await db.challengeProgressLog.findFirst({
    where: { id: parsed.data.logId, familyId: family.id },
  });
  if (!log) {
    return { error: "Check-in not found." };
  }

  if (log.status !== "SUBMITTED") {
    return { error: "Only submitted check-ins can be sent back." };
  }

  assertChallengeTransition(log.status, "SENT_BACK");

  await db.challengeProgressLog.update({
    where: { id: log.id },
    data: {
      status: "SENT_BACK",
      reviewNote: parsed.data.reviewNote,
      reviewedAt: new Date(),
      reviewedByUserId: userId,
    },
  });

  revalidateChallengePaths(log.cubId);
  return { success: "Sent back for another try." };
}
