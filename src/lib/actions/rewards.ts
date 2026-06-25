"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionState } from "@/lib/actions/auth";
import { db } from "@/lib/db";
import {
  applyStoreRewardGrant,
  ensureDefaultRewardStoreItems,
} from "@/lib/rewards";
import { requireFamilyForUser, requireUserId } from "@/lib/session";

const rewardItemSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(120),
    description: z.string().trim().max(500).optional(),
    costFocusTokens: z.coerce.number().int().min(1).max(50),
    grantType: z.enum(["NONE", "PHONE_TIME", "WEEKEND_BANK", "FOCUS_AREA_SWAP"]),
    minutesGranted: z.coerce.number().int().min(0).max(240).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.grantType !== "NONE" &&
      data.grantType !== "FOCUS_AREA_SWAP" &&
      (!data.minutesGranted || data.minutesGranted < 1)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Enter minutes to grant for phone or Weekend Bank rewards.",
        path: ["minutesGranted"],
      });
    }
  });

const redeemSchema = z.object({
  cubId: z.string().min(1),
  rewardStoreItemId: z.string().min(1),
});

function revalidateRewardPaths(cubId: string) {
  revalidatePath("/dashboard/rewards");
  revalidatePath(`/dashboard/cubs/${cubId}/progress`);
  revalidatePath(`/cub/${cubId}/progress`);
  revalidatePath(`/cub/${cubId}/progress/growth`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/cubs");
}

export async function createRewardStoreItemAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const parsed = rewardItemSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    costFocusTokens: formData.get("costFocusTokens"),
    grantType: formData.get("grantType") || "NONE",
    minutesGranted: formData.get("minutesGranted") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await db.rewardStoreItem.create({
    data: {
      familyId: family.id,
      title: parsed.data.title,
      description: parsed.data.description,
      costFocusTokens: parsed.data.costFocusTokens,
      grantType: parsed.data.grantType,
      minutesGranted:
        parsed.data.grantType === "NONE" ? null : parsed.data.minutesGranted ?? null,
    },
  });

  revalidatePath("/dashboard/rewards");
  return { success: "Reward added to the store." };
}

export async function redeemRewardAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const parsed = redeemSchema.safeParse({
    cubId: formData.get("cubId"),
    rewardStoreItemId: formData.get("rewardStoreItemId"),
  });

  if (!parsed.success) {
    return { error: "Invalid redemption." };
  }

  const cub = family.cubs.find((item) => item.id === parsed.data.cubId);
  if (!cub) {
    return { error: "Cub not found." };
  }

  const item = await db.rewardStoreItem.findFirst({
    where: {
      id: parsed.data.rewardStoreItemId,
      familyId: family.id,
      isActive: true,
    },
  });

  if (!item) {
    return { error: "Reward not found." };
  }

  const balance = await db.focusTokenLedgerEntry.aggregate({
    where: { cubId: cub.id },
    _sum: { amount: true },
  });
  const available = balance._sum.amount ?? 0;

  if (available < item.costFocusTokens) {
    return {
      error: `${cub.displayName} needs ${item.costFocusTokens} Focus Token${item.costFocusTokens === 1 ? "" : "s"} (has ${available}).`,
    };
  }

  let grantMessage = "";

  await db.$transaction(async (tx) => {
    await tx.focusTokenLedgerEntry.create({
      data: {
        cubId: cub.id,
        amount: -item.costFocusTokens,
        reason: "REWARD_REDEMPTION",
        note: `Redeemed: ${item.title}`,
        createdByUserId: userId,
      },
    });

    const granted = await applyStoreRewardGrant(
      cub,
      {
        title: item.title,
        grantType: item.grantType,
        minutesGranted: item.minutesGranted,
      },
      userId,
      tx,
    );

    await tx.rewardRedemption.create({
      data: {
        cubId: cub.id,
        rewardStoreItemId: item.id,
        createdByUserId: userId,
        focusTokensSpent: item.costFocusTokens,
        phoneMinutesGranted: granted.phoneMinutes,
        weekendBankMinutesGranted: granted.weekendBankMinutes,
      },
    });

    if (granted.phoneMinutes > 0) {
      grantMessage = ` ${granted.phoneMinutes} min added to phone time today.`;
    } else if (granted.weekendBankMinutes > 0) {
      grantMessage = ` ${granted.weekendBankMinutes} min added to Weekend Bank.`;
    } else if (granted.focusAreaSwaps > 0) {
      grantMessage = ` +1 Focus area swap added (${(cub.focusAreaSwapCredits ?? 0) + 1} total).`;
    }
  });

  revalidateRewardPaths(cub.id);
  return {
    success: `Redeemed “${item.title}” for ${cub.displayName}.${grantMessage}`,
  };
}

export async function seedRewardStoreForFamily(familyId: string) {
  await ensureDefaultRewardStoreItems(familyId);
}
