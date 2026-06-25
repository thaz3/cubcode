"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  ensureDefaultGuardianNudgeRules,
  ensureGuardianNudgePreferences,
  syncGuardianNudgesForFamily,
} from "@/lib/guardian-nudges/sync";
import { requireParentPinConfigured } from "@/lib/require-parent-pin-configured";
import type { ActionState } from "@/lib/actions/auth";
import {
  guardianNudgePreferencesSchema,
  guardianNudgeRuleSchema,
  nudgeIdSchema,
} from "@/lib/validations/guardian-nudges";
import { requireFamilyForUser, requireUserId } from "@/lib/session";

function revalidateGuardianNudgePaths() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/family/settings");
  revalidatePath("/dashboard/tasks/review");
}

async function getFamilyNudge(nudgeId: string, familyId: string) {
  return db.guardianNudge.findFirst({
    where: { id: nudgeId, familyId },
  });
}

function normalizeHm(value?: string | null): string | null {
  if (!value?.trim()) return null;
  const match = /^(\d{1,2}):(\d{2})/.exec(value.trim());
  if (!match) return null;
  return `${match[1]!.padStart(2, "0")}:${match[2]}`;
}

export async function updateGuardianNudgePreferencesAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const pinCheck = await requireParentPinConfigured();
  if (!pinCheck.ok) {
    return { error: pinCheck.error };
  }

  const parsed = guardianNudgePreferencesSchema.safeParse({
    quietHoursStart: formData.get("quietHoursStart")?.toString() || undefined,
    quietHoursEnd: formData.get("quietHoursEnd")?.toString() || undefined,
    timezone: formData.get("timezone")?.toString() || "America/New_York",
    dailySummaryEnabled: formData.get("dailySummaryEnabled") === "on",
    dailySummaryTime: formData.get("dailySummaryTime")?.toString() || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const start = normalizeHm(parsed.data.quietHoursStart);
  const end = normalizeHm(parsed.data.quietHoursEnd);
  if ((start && !end) || (!start && end)) {
    return { error: "Set both quiet hour start and end, or leave both blank." };
  }

  await ensureGuardianNudgePreferences(family.id);
  await db.guardianNudgePreferences.update({
    where: { familyId: family.id },
    data: {
      quietHoursStart: start,
      quietHoursEnd: end,
      timezone: parsed.data.timezone,
      dailySummaryEnabled: parsed.data.dailySummaryEnabled,
      dailySummaryTime:
        normalizeHm(parsed.data.dailySummaryTime) ??
        (parsed.data.dailySummaryEnabled ? "08:00" : null),
    },
  });

  await ensureDefaultGuardianNudgeRules(family.id, userId);
  const summaryRule = await db.guardianNudgeRule.findUnique({
    where: {
      familyId_type: { familyId: family.id, type: "DAILY_SUMMARY" },
    },
  });
  if (summaryRule) {
    await db.guardianNudgeRule.update({
      where: { id: summaryRule.id },
      data: { enabled: parsed.data.dailySummaryEnabled },
    });
  }

  revalidateGuardianNudgePaths();
  return { success: "Guardian Nudge preferences saved." };
}

export async function updateGuardianNudgeRuleAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const pinCheck = await requireParentPinConfigured();
  if (!pinCheck.ok) {
    return { error: pinCheck.error };
  }

  const parsed = guardianNudgeRuleSchema.safeParse({
    type: formData.get("type"),
    enabled: formData.get("enabled") === "on",
    offsetMinutes: formData.get("offsetMinutes")?.toString() || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await ensureDefaultGuardianNudgeRules(family.id, userId);

  await db.guardianNudgeRule.update({
    where: {
      familyId_type: {
        familyId: family.id,
        type: parsed.data.type,
      },
    },
    data: {
      enabled: parsed.data.enabled,
      offsetMinutes:
        parsed.data.type === "NOT_STARTED_BEFORE_DUE" ||
        parsed.data.type === "NOT_TOUCHED_AFTER_ASSIGN"
          ? (parsed.data.offsetMinutes ?? 120)
          : null,
      createdByUserId: userId,
    },
  });

  await syncGuardianNudgesForFamily(family.id);
  revalidateGuardianNudgePaths();
  return { success: "Guardian Nudge rule saved." };
}

export async function dismissGuardianNudgeAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const parsed = nudgeIdSchema.safeParse({
    nudgeId: formData.get("nudgeId"),
  });
  if (!parsed.success) {
    return { error: "Nudge not found." };
  }

  const nudge = await getFamilyNudge(parsed.data.nudgeId, family.id);
  if (!nudge) {
    return { error: "Nudge not found." };
  }

  await db.guardianNudge.update({
    where: { id: nudge.id },
    data: { status: "DISMISSED", dismissedAt: new Date() },
  });

  revalidateGuardianNudgePaths();
  return { success: "Nudge dismissed." };
}

export async function markGuardianNudgeSeenAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const parsed = nudgeIdSchema.safeParse({
    nudgeId: formData.get("nudgeId"),
  });
  if (!parsed.success) {
    return { error: "Nudge not found." };
  }

  const nudge = await getFamilyNudge(parsed.data.nudgeId, family.id);
  if (!nudge || nudge.status !== "ACTIVE") {
    return { success: "Already seen." };
  }

  await db.guardianNudge.update({
    where: { id: nudge.id },
    data: { status: "SEEN", seenAt: new Date() },
  });

  revalidateGuardianNudgePaths();
  return { success: "Marked seen." };
}

export async function syncGuardianNudgesAction(familyId: string) {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);
  if (family.id !== familyId) {
    throw new Error("Unauthorized");
  }
  await syncGuardianNudgesForFamily(family.id);
}
