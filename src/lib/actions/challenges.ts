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
  routineGroupKeyFromChallenge,
  routineGroupKeyFromDefinition,
  type RoutineDefinitionKey,
} from "@/lib/assignment-routine-groups";
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
import { debugServerAction } from "@/lib/form-debug-server";

function revalidateChallengePaths(cubIds: string[]) {
  const uniqueCubIds = [...new Set(cubIds)];
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard/challenges");
  revalidatePath("/dashboard/tasks");
  for (const cubId of uniqueCubIds) {
    revalidatePath(`/cub/${cubId}`);
    revalidatePath(`/cub/${cubId}/challenges`);
    revalidatePath(`/cub/${cubId}/tasks`);
  }
}

function parseCubIdsFromForm(formData: FormData): string[] {
  const selected = formData
    .getAll("cubIds")
    .map((value) => String(value).trim())
    .filter(Boolean);
  if (selected.length > 0) {
    return [...new Set(selected)];
  }
  const legacy = formData.get("cubId")?.toString().trim();
  return legacy ? [legacy] : [];
}

function parseChallengeFormData(formData: FormData) {
  const customDays = parseCustomDaysFromForm(formData);
  const growthCategory = formData.get("growthCategory");
  return challengeSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    intervalType: formData.get("intervalType"),
    customDays: customDays.length > 0 ? customDays : undefined,
    proofType: formData.get("proofType"),
    proofPrompt: formData.get("proofPrompt") || undefined,
    proofChecklistItems: formData.get("proofChecklistItems") || undefined,
    xpEarned: formData.get("xpEarned"),
    focusTokensEarned: formData.get("focusTokensEarned"),
    phoneMinutesEarned: formData.get("phoneMinutesEarned"),
    growthCategory:
      growthCategory && String(growthCategory).trim()
        ? growthCategory
        : undefined,
  });
}

function routineDefinitionFromParsed(
  data: Parameters<typeof validateChallengeDefinition>[0],
) {
  const intervalConfig: Prisma.InputJsonValue | undefined =
    data.intervalType === "CUSTOM" && data.customDays
      ? { daysOfWeek: data.customDays }
      : undefined;

  return {
    title: data.title,
    intervalType: data.intervalType,
    intervalConfig: (intervalConfig ?? null) as Prisma.JsonValue | null,
    proofType: data.proofType,
    intervalConfigForDb: intervalConfig,
  };
}

function challengeDataFromParsed(
  data: Parameters<typeof validateChallengeDefinition>[0],
  userId: string,
  familyId: string,
  cubId: string,
) {
  const definition = routineDefinitionFromParsed(data);

  return {
    title: data.title,
    description: data.description ?? null,
    cubId,
    familyId,
    createdByUserId: userId,
    intervalType: definition.intervalType,
    intervalConfig: definition.intervalConfigForDb,
    proofType: data.proofType,
    proofPrompt: data.proofPrompt || null,
    proofChecklistItems: data.proofChecklistItems ?? undefined,
    growthCategory: data.growthCategory ?? null,
    xpEarned: data.xpEarned,
    focusTokensEarned: data.focusTokensEarned,
    phoneMinutesEarned: data.phoneMinutesEarned,
  };
}

async function cubAlreadyHasRoutine(
  familyId: string,
  cubId: string,
  definition: RoutineDefinitionKey,
  excludeChallengeIds: string[] = [],
): Promise<boolean> {
  const challenges = await db.challenge.findMany({
    where: {
      familyId,
      cubId,
      status: { not: "ARCHIVED" },
      ...(excludeChallengeIds.length > 0
        ? { id: { notIn: excludeChallengeIds } }
        : {}),
    },
    select: {
      id: true,
      title: true,
      intervalType: true,
      intervalConfig: true,
      proofType: true,
    },
  });

  const key = routineGroupKeyFromDefinition(definition);
  return challenges.some(
    (challenge) => routineGroupKeyFromChallenge(challenge) === key,
  );
}

export async function createChallengeAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  debugServerAction("createChallengeAction", "start", {
    title: formData.get("title")?.toString(),
    cubIds: formData.getAll("cubIds").map(String),
  });

  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const parsed = parseChallengeFormData(formData);
  if (!parsed.success) {
    const error = parsed.error.issues[0]?.message ?? "Invalid input.";
    debugServerAction("createChallengeAction", "error", { error });
    return { error };
  }

  const validationError = validateChallengeDefinition(parsed.data);
  if (validationError) {
    debugServerAction("createChallengeAction", "error", { error: validationError });
    return { error: validationError };
  }

  const cubIds = parseCubIdsFromForm(formData);
  if (cubIds.length === 0) {
    debugServerAction("createChallengeAction", "error", {
      error: "Pick at least one Cub.",
    });
    return { error: "Pick at least one Cub." };
  }

  const definition = routineDefinitionFromParsed(parsed.data);

  for (const cubId of cubIds) {
    const cub = family.cubs.find((c) => c.id === cubId);
    if (!cub) {
      return { error: "Cub not found in your family." };
    }
    if (await cubAlreadyHasRoutine(family.id, cubId, definition)) {
      return {
        error: `${cub.displayName} already has a routine matching these settings.`,
      };
    }
  }

  const createdTitles: string[] = [];
  for (const cubId of cubIds) {
    const challenge = await db.challenge.create({
      data: challengeDataFromParsed(parsed.data, userId, family.id, cubId),
    });
    createdTitles.push(challenge.title);
  }

  revalidateChallengePaths(cubIds);

  const cubNames = cubIds
    .map((id) => family.cubs.find((c) => c.id === id)?.displayName)
    .filter(Boolean)
    .join(", ");

  const title = createdTitles[0] ?? "Routine";
  debugServerAction("createChallengeAction", "success", {
    title,
    cubIds,
  });
  return {
    success:
      cubIds.length === 1
        ? `Routine "${title}" was created for ${cubNames}. It will appear on their routines board.`
        : `Routine "${title}" was created for ${cubNames}. It will appear on their routines boards.`,
  };
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
    include: {
      progressLogs: { select: { status: true } },
    },
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

  const cubIds = parseCubIdsFromForm(formData);
  if (cubIds.length === 0) {
    return { error: "Pick at least one Cub." };
  }

  for (const cubId of cubIds) {
    if (!family.cubs.some((c) => c.id === cubId)) {
      return { error: "Cub not found in your family." };
    }
  }

  const memberIds = formData
    .getAll("groupMemberIds")
    .map((value) => String(value).trim())
    .filter(Boolean);

  const existingMembers = memberIds.length
    ? await db.challenge.findMany({
        where: {
          id: { in: memberIds },
          familyId: family.id,
          status: { not: "ARCHIVED" },
        },
        include: {
          progressLogs: { select: { status: true } },
        },
      })
    : [challenge];

  const definition = routineDefinitionFromParsed(parsed.data);
  const sharedUpdate = {
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    intervalType: definition.intervalType,
    intervalConfig: definition.intervalConfigForDb,
    proofType: parsed.data.proofType,
    proofPrompt: parsed.data.proofPrompt || null,
    proofChecklistItems: parsed.data.proofChecklistItems ?? undefined,
    growthCategory: parsed.data.growthCategory ?? null,
    xpEarned: parsed.data.xpEarned,
    focusTokensEarned: parsed.data.focusTokensEarned,
    phoneMinutesEarned: parsed.data.phoneMinutesEarned,
  };

  const affectedCubIds = new Set<string>();
  const memberIdsBeingKept = new Set<string>();

  for (const cubId of cubIds) {
    const existing = existingMembers.find((member) => member.cubId === cubId);
    if (existing) {
      if (
        await cubAlreadyHasRoutine(family.id, cubId, definition, [
          ...existingMembers.map((member) => member.id),
        ])
      ) {
        const cubName =
          family.cubs.find((c) => c.id === cubId)?.displayName ?? "Cub";
        return {
          error: `${cubName} already has another routine matching these settings.`,
        };
      }

      await db.challenge.update({
        where: { id: existing.id },
        data: sharedUpdate,
      });
      memberIdsBeingKept.add(existing.id);
      affectedCubIds.add(cubId);
      continue;
    }

    if (await cubAlreadyHasRoutine(family.id, cubId, definition)) {
      const cubName =
        family.cubs.find((c) => c.id === cubId)?.displayName ?? "Cub";
      return {
        error: `${cubName} already has a routine matching these settings.`,
      };
    }

    await db.challenge.create({
      data: {
        ...sharedUpdate,
        cubId,
        familyId: family.id,
        createdByUserId: userId,
      },
    });
    affectedCubIds.add(cubId);
  }

  for (const member of existingMembers) {
    if (memberIdsBeingKept.has(member.id)) {
      continue;
    }

    affectedCubIds.add(member.cubId);

    if (challengeHasMeaningfulProgress(member.progressLogs)) {
      await db.challenge.update({
        where: { id: member.id },
        data: { status: "ARCHIVED" },
      });
    } else {
      await db.challenge.delete({ where: { id: member.id } });
    }
  }

  revalidateChallengePaths([...affectedCubIds]);
  revalidatePath(`/dashboard/challenges/${challenge.id}`);
  revalidatePath(`/dashboard/challenges/${challenge.id}/edit`);

  const cubNames = [...affectedCubIds]
    .map((id) => family.cubs.find((c) => c.id === id)?.displayName)
    .filter(Boolean)
    .join(", ");

  return {
    success: cubIds.length === 1
      ? `Routine updated for ${cubNames}.`
      : `Routine updated for ${cubNames}.`,
  };
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

  revalidateChallengePaths([challenge.cubId]);
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

  revalidateChallengePaths([challenge.cubId]);
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
  revalidateChallengePaths([challenge.cubId]);
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

  revalidateChallengePaths([challenge.cubId]);
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

  revalidateChallengePaths([challenge.cubId]);
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

  revalidateChallengePaths([log.cubId]);
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

  revalidateChallengePaths([log.cubId]);
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

  revalidateChallengePaths([log.cubId]);
  return { success: "Sent back for another try." };
}
