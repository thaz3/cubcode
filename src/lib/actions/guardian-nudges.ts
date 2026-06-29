"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  ensureDefaultGuardianNudgeRules,
  ensureGuardianNudgePreferences,
  syncGuardianNudgesForFamily,
} from "@/lib/guardian-nudges/sync";
import { GUARDIAN_NUDGE_SETTINGS_ORDER } from "@/lib/guardian-nudges/types";
import { requireParentPinConfigured } from "@/lib/require-parent-pin-configured";
import type { ActionState } from "@/lib/actions/auth";
import {
  guardianNudgePreferencesSchema,
  guardianNudgeRuleSchema,
  nudgeIdSchema,
} from "@/lib/validations/guardian-nudges";
import { isGuardianNudgeDismissAllowed } from "@/lib/guardian-nudges/rule-state";
import { requireFamilyForUser, requireUserId } from "@/lib/session";
import type { GuardianNudgeRuleType } from "@/generated/prisma/client";

function revalidateGuardianNudgePaths() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/family/settings");
  revalidatePath("/dashboard/tasks");
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

function ruleEnabledFromForm(
  formData: FormData,
  type: GuardianNudgeRuleType,
): boolean {
  return formData.get(`rule_${type}_enabled`) === "on";
}

export async function updateGuardianNudgesSettingsAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const pinCheck = await requireParentPinConfigured();
  if (!pinCheck.ok) {
    return { error: pinCheck.error };
  }

  const prefsParsed = guardianNudgePreferencesSchema.safeParse({
    quietHoursStart: formData.get("quietHoursStart")?.toString() || undefined,
    quietHoursEnd: formData.get("quietHoursEnd")?.toString() || undefined,
    timezone: formData.get("timezone")?.toString() || "America/New_York",
    dailySummaryEnabled: formData.get("dailySummaryEnabled") === "on",
    dailySummaryTime: formData.get("dailySummaryTime")?.toString() || undefined,
  });

  if (!prefsParsed.success) {
    return { error: prefsParsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const quietStart = normalizeHm(prefsParsed.data.quietHoursStart);
  const quietEnd = normalizeHm(prefsParsed.data.quietHoursEnd);
  if ((quietStart && !quietEnd) || (!quietStart && quietEnd)) {
    return {
      error: "Set both a start and end time for quiet hours, or leave both blank.",
    };
  }

  for (const type of GUARDIAN_NUDGE_SETTINGS_ORDER) {
    const ruleParsed = guardianNudgeRuleSchema.safeParse({
      type,
      enabled: ruleEnabledFromForm(formData, type),
      offsetMinutes:
        formData.get(`rule_${type}_offsetMinutes`)?.toString() || undefined,
    });

    if (!ruleParsed.success) {
      return { error: ruleParsed.error.issues[0]?.message ?? "Invalid input" };
    }
  }

  await ensureDefaultGuardianNudgeRules(family.id, userId);
  await ensureGuardianNudgePreferences(family.id);

  await db.guardianNudgePreferences.update({
    where: { familyId: family.id },
    data: {
      quietHoursStart: quietStart,
      quietHoursEnd: quietEnd,
      timezone: prefsParsed.data.timezone,
      dailySummaryEnabled: prefsParsed.data.dailySummaryEnabled,
      dailySummaryTime:
        normalizeHm(prefsParsed.data.dailySummaryTime) ??
        (prefsParsed.data.dailySummaryEnabled ? "08:00" : null),
    },
  });

  for (const type of GUARDIAN_NUDGE_SETTINGS_ORDER) {
    const enabled = ruleEnabledFromForm(formData, type);
    const offsetRaw = formData.get(`rule_${type}_offsetMinutes`)?.toString();
    const offsetMinutes =
      type === "NOT_STARTED_BEFORE_DUE" ||
      type === "NOT_TOUCHED_AFTER_ASSIGN"
        ? Number(offsetRaw ?? 120)
        : null;

    await db.guardianNudgeRule.update({
      where: {
        familyId_type: { familyId: family.id, type },
      },
      data: {
        enabled,
        offsetMinutes,
        createdByUserId: userId,
      },
    });
  }

  const summaryRule = await db.guardianNudgeRule.findUnique({
    where: {
      familyId_type: { familyId: family.id, type: "DAILY_SUMMARY" },
    },
  });
  if (summaryRule) {
    await db.guardianNudgeRule.update({
      where: { id: summaryRule.id },
      data: { enabled: prefsParsed.data.dailySummaryEnabled },
    });
  }

  await syncGuardianNudgesForFamily(family.id);
  revalidateGuardianNudgePaths();
  return { success: "Reminders saved." };
}

export async function updateGuardianNudgePreferencesAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return updateGuardianNudgesSettingsAction(_prevState, formData);
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
  return { success: "Reminders saved." };
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

  if (!isGuardianNudgeDismissAllowed(nudge.type)) {
    return {
      error:
        "Review reminders stay until you review the task. Mark seen or open Review when ready.",
    };
  }

  await db.guardianNudge.update({
    where: { id: nudge.id },
    data: { status: "DISMISSED", dismissedAt: new Date() },
  });

  revalidateGuardianNudgePaths();
  return { success: "Reminder cleared." };
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
