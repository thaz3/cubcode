"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionState } from "@/lib/actions/auth";
import {
  formatWeekLabel,
  getCouncilDayBonus,
  getWeekStart,
  isCouncilDayEntryComplete,
  parseWeekParam,
  validateCouncilDayCubEntry,
} from "@/lib/council-day";
import { parseCouncilDayValueRatings, parseCouncilDayValueRatingsFromFormData, parseFamilyDayBonusField } from "@/lib/council-day-values";
import { db } from "@/lib/db";
import { FAMILY_DAY_LABEL } from "@/lib/family-day-labels";
import { creditCouncilDayBonus } from "@/lib/rewards";
import { requireFamilyForUser, requireUserId } from "@/lib/session";

const councilDayNotesSchema = z.object({
  winNote: z.string().trim().max(5000).optional(),
  growNote: z.string().trim().max(5000).optional(),
  familyGoalNote: z.string().trim().max(5000).optional(),
  reflection: z.string().trim().max(5000).optional(),
  familyNotes: z.string().trim().max(5000).optional(),
});

function revalidateFamilyDayPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/family-day");
  revalidatePath("/dashboard/council-day");
  revalidatePath("/dashboard/cubs");
}

async function getFamilySession(sessionId: string, familyId: string) {
  return db.councilDaySession.findFirst({
    where: { id: sessionId, familyId },
    include: {
      cubEntries: true,
    },
  });
}

async function ensureCouncilDaySession(familyId: string, weekStartsOn: Date) {
  const normalizedWeek = getWeekStart(weekStartsOn);

  return db.councilDaySession.upsert({
    where: {
      familyId_weekStartsOn: {
        familyId,
        weekStartsOn: normalizedWeek,
      },
    },
    create: {
      familyId,
      weekStartsOn: normalizedWeek,
    },
    update: {},
    include: { cubEntries: true },
  });
}

export async function startCouncilDayAction(
  weekParam?: string,
): Promise<ActionState & { sessionId?: string }> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  if (family.cubs.length === 0) {
    return { error: `Add a Cub before running ${FAMILY_DAY_LABEL}.` };
  }

  const weekStartsOn = parseWeekParam(weekParam);
  const session = await ensureCouncilDaySession(family.id, weekStartsOn);

  revalidateFamilyDayPaths();
  return {
    success: `${FAMILY_DAY_LABEL} started for ${formatWeekLabel(session.weekStartsOn)}.`,
    sessionId: session.id,
  };
}

export async function saveCouncilDayCubEntryAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const sessionId = formData.get("sessionId")?.toString();
  const cubId = formData.get("cubId")?.toString();

  if (!sessionId || !cubId) {
    return { error: `Missing ${FAMILY_DAY_LABEL} session.` };
  }

  const cub = family.cubs.find((item) => item.id === cubId);
  if (!cub) {
    return { error: "Cub not found." };
  }

  const session = await getFamilySession(sessionId, family.id);
  if (!session) {
    return { error: `${FAMILY_DAY_LABEL} session not found.` };
  }

  if (session.conductedAt) {
    return { error: `This ${FAMILY_DAY_LABEL} is already complete.` };
  }

  const parsed = councilDayNotesSchema.safeParse({
    winNote: formData.get("winNote")?.toString(),
    growNote: formData.get("growNote")?.toString(),
    familyGoalNote: formData.get("familyGoalNote")?.toString(),
    reflection: formData.get("reflection")?.toString(),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const bonus = getCouncilDayBonus(cub.ageBand);

  await db.councilDayCubEntry.upsert({
    where: {
      sessionId_cubId: { sessionId: session.id, cubId: cub.id },
    },
    create: {
      sessionId: session.id,
      cubId: cub.id,
      winNote: parsed.data.winNote || null,
      growNote: parsed.data.growNote || null,
      familyGoalNote: parsed.data.familyGoalNote || null,
      reflection: parsed.data.reflection || null,
      bonusXpGranted: bonus.xp,
      bonusTokensGranted: bonus.focusTokens,
      bonusPhoneMinutesGranted: bonus.phoneMinutes,
    },
    update: {
      winNote: parsed.data.winNote || null,
      growNote: parsed.data.growNote || null,
      familyGoalNote: parsed.data.familyGoalNote || null,
      reflection: parsed.data.reflection || null,
    },
  });

  revalidateFamilyDayPaths();
  return {
    success: `Progress saved for ${cub.displayName}. Return anytime this week to finish ${FAMILY_DAY_LABEL}.`,
  };
}

export async function saveCouncilDayFamilyNotesAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const sessionId = formData.get("sessionId")?.toString();
  if (!sessionId) {
    return { error: `Missing ${FAMILY_DAY_LABEL} session.` };
  }

  const session = await getFamilySession(sessionId, family.id);
  if (!session) {
    return { error: `${FAMILY_DAY_LABEL} session not found.` };
  }

  if (session.conductedAt) {
    return { error: `This ${FAMILY_DAY_LABEL} is already complete.` };
  }

  const parsed = councilDayNotesSchema.safeParse({
    familyNotes: formData.get("familyNotes")?.toString(),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await db.councilDaySession.update({
    where: { id: session.id },
    data: { familyNotes: parsed.data.familyNotes || null },
  });

  revalidateFamilyDayPaths();
  return {
    success: `Household notes saved. You can return later to complete ${FAMILY_DAY_LABEL}.`,
  };
}

export async function saveFamilyDayValueRatingsAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const sessionId = formData.get("sessionId")?.toString();
  if (!sessionId) {
    return { error: `Missing ${FAMILY_DAY_LABEL} session.` };
  }

  const session = await getFamilySession(sessionId, family.id);
  if (!session) {
    return { error: `${FAMILY_DAY_LABEL} session not found.` };
  }

  if (session.conductedAt) {
    return { error: `This ${FAMILY_DAY_LABEL} is already complete.` };
  }

  for (const cub of family.cubs) {
    const valueRatings = parseCouncilDayValueRatingsFromFormData(formData, cub.id);
    const bonus = getCouncilDayBonus(cub.ageBand);
    await db.councilDayCubEntry.upsert({
      where: {
        sessionId_cubId: { sessionId: session.id, cubId: cub.id },
      },
      create: {
        sessionId: session.id,
        cubId: cub.id,
        valueRatings,
        bonusXpGranted: bonus.xp,
        bonusTokensGranted: bonus.focusTokens,
        bonusPhoneMinutesGranted: bonus.phoneMinutes,
      },
      update: {
        valueRatings,
      },
    });
  }

  revalidateFamilyDayPaths();
  return { success: "Values & expectations saved for all Cubs." };
}

export async function saveFamilyDayBonusesAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const sessionId = formData.get("sessionId")?.toString();
  if (!sessionId) {
    return { error: `Missing ${FAMILY_DAY_LABEL} session.` };
  }

  const session = await getFamilySession(sessionId, family.id);
  if (!session) {
    return { error: `${FAMILY_DAY_LABEL} session not found.` };
  }

  if (session.conductedAt) {
    return { error: `This ${FAMILY_DAY_LABEL} is already complete.` };
  }

  for (const cub of family.cubs) {
    const suggested = getCouncilDayBonus(cub.ageBand);
    const existing = session.cubEntries.find((entry) => entry.cubId === cub.id);
    const bonusXpGranted = parseFamilyDayBonusField(
      formData,
      `bonusXp_${cub.id}`,
      existing?.bonusXpGranted ?? suggested.xp,
    );
    const bonusTokensGranted = parseFamilyDayBonusField(
      formData,
      `bonusTokens_${cub.id}`,
      existing?.bonusTokensGranted ?? suggested.focusTokens,
    );
    const bonusPhoneMinutesGranted = parseFamilyDayBonusField(
      formData,
      `bonusPhone_${cub.id}`,
      existing?.bonusPhoneMinutesGranted ?? suggested.phoneMinutes,
    );

    await db.councilDayCubEntry.upsert({
      where: {
        sessionId_cubId: { sessionId: session.id, cubId: cub.id },
      },
      create: {
        sessionId: session.id,
        cubId: cub.id,
        bonusXpGranted,
        bonusTokensGranted,
        bonusPhoneMinutesGranted,
      },
      update: {
        bonusXpGranted,
        bonusTokensGranted,
        bonusPhoneMinutesGranted,
      },
    });
  }

  revalidateFamilyDayPaths();
  return { success: "Bonus amounts saved." };
}

export async function completeCouncilDayAction(
  sessionId: string,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const session = await db.councilDaySession.findFirst({
    where: { id: sessionId, familyId: family.id },
    include: {
      cubEntries: true,
    },
  });

  if (!session) {
    return { error: `${FAMILY_DAY_LABEL} session not found.` };
  }

  if (session.conductedAt) {
    return { error: `This ${FAMILY_DAY_LABEL} is already complete.` };
  }

  if (family.cubs.length === 0) {
    return { error: "No Cubs in this household." };
  }

  const weekLabel = formatWeekLabel(session.weekStartsOn);

  for (const cub of family.cubs) {
    const entry = session.cubEntries.find((item) => item.cubId === cub.id);
    const validationError = validateCouncilDayCubEntry(cub, {
      winNote: entry?.winNote ?? undefined,
      growNote: entry?.growNote ?? undefined,
      familyGoalNote: entry?.familyGoalNote ?? undefined,
      reflection: entry?.reflection ?? undefined,
      valueRatings: parseCouncilDayValueRatings(entry?.valueRatings),
    });

    if (validationError) {
      return {
        error: `${cub.displayName}: ${validationError} Save their notes before completing.`,
      };
    }
  }

  await db.$transaction(async (tx) => {
    const freshSession = await tx.councilDaySession.findFirstOrThrow({
      where: { id: session.id },
      include: { cubEntries: true },
    });

    for (const cub of family.cubs) {
      const entry = freshSession.cubEntries.find((item) => item.cubId === cub.id);
      const suggested = getCouncilDayBonus(cub.ageBand);

      if (!entry) {
        throw new Error(`Missing saved progress for ${cub.displayName}`);
      }

      if (!isCouncilDayEntryComplete(cub, {
        ...entry,
        valueRatings: parseCouncilDayValueRatings(entry.valueRatings),
      })) {
        throw new Error(`Incomplete notes for ${cub.displayName}`);
      }

      const bonusEntry = {
        ...entry,
        bonusXpGranted: entry.bonusXpGranted ?? suggested.xp,
        bonusTokensGranted: entry.bonusTokensGranted ?? suggested.focusTokens,
        bonusPhoneMinutesGranted:
          entry.bonusPhoneMinutesGranted ?? suggested.phoneMinutes,
      };

      await creditCouncilDayBonus(
        bonusEntry,
        cub,
        weekLabel,
        userId,
        tx,
      );
    }

    await tx.councilDaySession.update({
      where: { id: session.id },
      data: {
        conductedAt: new Date(),
        conductedByUserId: userId,
      },
    });
  });

  revalidateFamilyDayPaths();
  for (const cub of family.cubs) {
    revalidatePath(`/dashboard/cubs/${cub.id}/progress`);
  }

  return {
    success: `${FAMILY_DAY_LABEL} complete for ${weekLabel}. Bonuses credited to each Cub.`,
  };
}

export async function resetFamilyDaySessionAction(
  sessionId: string,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const session = await db.councilDaySession.findFirst({
    where: { id: sessionId, familyId: family.id },
    include: { cubEntries: true },
  });

  if (!session) {
    return { error: `${FAMILY_DAY_LABEL} session not found.` };
  }

  const entryIds = session.cubEntries.map((entry) => entry.id);
  const wasComplete = Boolean(session.conductedAt);

  await db.$transaction(async (tx) => {
    if (entryIds.length > 0) {
      await tx.xpLedgerEntry.deleteMany({
        where: { councilDayCubEntryId: { in: entryIds } },
      });
      await tx.focusTokenLedgerEntry.deleteMany({
        where: { councilDayCubEntryId: { in: entryIds } },
      });
      await tx.phoneTimeLedgerEntry.deleteMany({
        where: { councilDayCubEntryId: { in: entryIds } },
      });
    }

    await tx.councilDaySession.delete({ where: { id: session.id } });
  });

  revalidateFamilyDayPaths();
  for (const cub of family.cubs) {
    revalidatePath(`/dashboard/cubs/${cub.id}/progress`);
  }

  return {
    success: wasComplete
      ? `${FAMILY_DAY_LABEL} erased for this week. Bonuses were reversed — you can start over.`
      : `${FAMILY_DAY_LABEL} erased for this week. You can start over.`,
  };
}
