"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireFamilyForUser, requireUserId } from "@/lib/session";
import { cubSchema } from "@/lib/validations/auth";
import type { ActionState } from "@/lib/actions/auth";
import type { z } from "zod";

type ParsedCub = z.infer<typeof cubSchema>;

function parseCubFormData(
  formData: FormData,
): { ok: true; data: ParsedCub } | { ok: false; error: string } {
  const growthValues = formData
    .getAll("requiredGrowthCategories")
    .map((value) => String(value));

  const parsed = cubSchema.safeParse({
    displayName: formData.get("displayName"),
    ageBand: formData.get("ageBand"),
    focusMinutesEarned: formData.get("focusMinutesEarned"),
    phoneMinutesEarned: formData.get("phoneMinutesEarned"),
    xpEarned: formData.get("xpEarned"),
    focusTokensEarned: formData.get("focusTokensEarned"),
    dailyPhoneCapMinutes: formData.get("dailyPhoneCapMinutes"),
    weekendBankCapMinutes: formData.get("weekendBankCapMinutes"),
    supervisionLevel: formData.get("supervisionLevel"),
    requiredGrowthCategories: growthValues,
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  return { ok: true, data: parsed.data };
}

function cubSettingsData(parsed: ParsedCub) {
  return {
    displayName: parsed.displayName,
    ageBand: parsed.ageBand,
    focusMinutesEarned: parsed.focusMinutesEarned,
    phoneMinutesEarned: parsed.phoneMinutesEarned,
    xpEarned: parsed.xpEarned,
    focusTokensEarned: parsed.focusTokensEarned,
    dailyPhoneCapMinutes: parsed.dailyPhoneCapMinutes,
    weekendBankCapMinutes: parsed.weekendBankCapMinutes,
    supervisionLevel: parsed.supervisionLevel,
    requiredGrowthCategories: parsed.requiredGrowthCategories,
  };
}

export async function createCubAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const parsed = parseCubFormData(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  await db.cub.create({
    data: {
      familyId: family.id,
      ...cubSettingsData(parsed.data),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/cubs");

  redirect("/dashboard/cubs");
}

export async function updateCubAction(
  cubId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const cub = await db.cub.findFirst({
    where: { id: cubId, familyId: family.id },
  });

  if (!cub) {
    return { error: "Cub not found." };
  }

  const parsed = parseCubFormData(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  await db.cub.update({
    where: { id: cub.id },
    data: cubSettingsData(parsed.data),
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/cubs");
  revalidatePath(`/dashboard/cubs/${cubId}/edit`);
  revalidatePath(`/dashboard/cubs/${cubId}/tasks`);

  return { success: "Cub profile updated." };
}

export async function deleteCubAction(cubId: string): Promise<void> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const cub = await db.cub.findFirst({
    where: { id: cubId, familyId: family.id },
  });

  if (!cub) {
    throw new Error("Cub not found.");
  }

  await db.cub.delete({ where: { id: cub.id } });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/cubs");

  redirect("/dashboard/cubs");
}
