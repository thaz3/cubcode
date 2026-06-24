"use server";

import { revalidatePath } from "next/cache";
import { AGE_BAND_DEFAULTS } from "@/lib/age-band-defaults";
import { db } from "@/lib/db";
import { requireFamilyForUser, requireUserId } from "@/lib/session";
import {
  familySettingsSchema,
  suggestedCapsSchema,
} from "@/lib/validations/auth";
import type { ActionState } from "@/lib/actions/auth";

export async function updateFamilySettingsAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const parsed = familySettingsSchema.safeParse({
    name: formData.get("name") || undefined,
    dailyPhoneCapMinutes: formData.get("dailyPhoneCapMinutes"),
    weekendBankCapMinutes: formData.get("weekendBankCapMinutes"),
    exchangeFocusMinutes: formData.get("exchangeFocusMinutes"),
    exchangePhoneMinutes: formData.get("exchangePhoneMinutes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await db.family.update({
    where: { id: family.id },
    data: {
      name: parsed.data.name || null,
      dailyPhoneCapMinutes: parsed.data.dailyPhoneCapMinutes,
      weekendBankCapMinutes: parsed.data.weekendBankCapMinutes,
      exchangeFocusMinutes: parsed.data.exchangeFocusMinutes,
      exchangePhoneMinutes: parsed.data.exchangePhoneMinutes,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/family/settings");

  return { success: "Household rules saved." };
}

export async function applySuggestedCapsAction(
  ageBand: string,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const parsed = suggestedCapsSchema.safeParse({ ageBand });
  if (!parsed.success) {
    return { error: "Invalid age band." };
  }

  const defaults = AGE_BAND_DEFAULTS[parsed.data.ageBand];

  await db.family.update({
    where: { id: family.id },
    data: {
      dailyPhoneCapMinutes: defaults.suggestedDailyPhoneCapMinutes,
      weekendBankCapMinutes: defaults.suggestedWeekendBankCapMinutes,
      exchangeFocusMinutes: defaults.suggestedExchangeFocusMinutes,
      exchangePhoneMinutes: defaults.suggestedExchangePhoneMinutes,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/family/settings");
  revalidatePath("/dashboard/cubs/new");
  revalidatePath("/dashboard/cubs");

  return {
    success: `Suggested caps applied for ${defaults.label} (${defaults.ageRange}).`,
  };
}
