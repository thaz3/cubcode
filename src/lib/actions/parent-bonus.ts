"use server";

import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/actions/auth";
import { db } from "@/lib/db";
import { growthCategoryShortLabel } from "@/lib/task-categories";
import { parseRequiredGrowthCategories } from "@/lib/focus-growth";
import { requireFamilyForUser, requireUserId } from "@/lib/session";
import { awardParentBonusXpSchema } from "@/lib/validations/parent-bonus";
import { cubProgressPath } from "@/lib/cub-progress-paths";

function revalidateParentBonusPaths(cubId: string) {
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/cubs/${cubId}/tasks`);
  revalidatePath(`/dashboard/cubs/${cubId}/progress`);
  revalidatePath(`/cub/${cubId}`);
  revalidatePath(cubProgressPath(cubId));
}

export async function awardParentBonusXpAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const parsed = awardParentBonusXpSchema.safeParse({
    cubId: formData.get("cubId"),
    growthCategory: formData.get("growthCategory"),
    amount: formData.get("amount"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const cub = family.cubs.find((c) => c.id === parsed.data.cubId);
  if (!cub) {
    return { error: "Cub not found." };
  }

  const allowedAreas = parseRequiredGrowthCategories(cub);
  if (!allowedAreas.includes(parsed.data.growthCategory)) {
    return { error: "That growth area is not enabled for this Cub." };
  }

  await db.xpLedgerEntry.create({
    data: {
      cubId: cub.id,
      amount: parsed.data.amount,
      reason: "PARENT_ADJUSTMENT",
      growthCategory: parsed.data.growthCategory,
      note: parsed.data.reason,
      createdByUserId: userId,
    },
  });

  revalidateParentBonusPaths(cub.id);

  return {
    success: `+${parsed.data.amount} XP for ${growthCategoryShortLabel(parsed.data.growthCategory)} — ${parsed.data.reason}`,
  };
}
