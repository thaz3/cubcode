"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionState } from "@/lib/actions/auth";
import type { Cub, Prisma, RewardStoreItem } from "@/generated/prisma/client";
import { requireCubForUser } from "@/lib/cub-access";
import { db } from "@/lib/db";
import {
  applyStoreRewardGrant,
  ensureDefaultRewardStoreItems,
} from "@/lib/rewards";
import { cubProgressPath } from "@/lib/cub-progress-paths";
import { requireFamilyForUser, requireUserId } from "@/lib/session";

type LedgerClient = Prisma.TransactionClient | typeof db;

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

const requestIdSchema = z.object({
  requestId: z.string().min(1),
});

function revalidateRewardPaths(cubId: string) {
  revalidatePath("/dashboard/rewards");
  revalidatePath(`/dashboard/cubs/${cubId}/progress`);
  revalidatePath(cubProgressPath(cubId));
  revalidatePath(`/cub/${cubId}/rewards`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/cubs");
}

async function getCubFocusTokenBalance(cubId: string, client: LedgerClient = db) {
  const balance = await client.focusTokenLedgerEntry.aggregate({
    where: { cubId },
    _sum: { amount: true },
  });
  return balance._sum.amount ?? 0;
}

function formatGrantMessage(
  cub: Cub,
  granted: {
    phoneMinutes: number;
    weekendBankMinutes: number;
    focusAreaSwaps: number;
  },
): string {
  if (granted.phoneMinutes > 0) {
    return ` ${granted.phoneMinutes} min added to phone time today.`;
  }
  if (granted.weekendBankMinutes > 0) {
    return ` ${granted.weekendBankMinutes} min added to Weekend Bank.`;
  }
  if (granted.focusAreaSwaps > 0) {
    return ` +1 Focus area swap added (${(cub.focusAreaSwapCredits ?? 0) + 1} total).`;
  }
  return "";
}

async function executeRewardRedemption(
  cub: Cub,
  item: Pick<
    RewardStoreItem,
    "id" | "title" | "costFocusTokens" | "grantType" | "minutesGranted"
  >,
  userId: string,
  client: LedgerClient,
) {
  const available = await getCubFocusTokenBalance(cub.id, client);

  if (available < item.costFocusTokens) {
    throw new Error(
      `${cub.displayName} needs ${item.costFocusTokens} Focus Token${item.costFocusTokens === 1 ? "" : "s"} (has ${available}).`,
    );
  }

  await client.focusTokenLedgerEntry.create({
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
    client,
  );

  await client.rewardRedemption.create({
    data: {
      cubId: cub.id,
      rewardStoreItemId: item.id,
      createdByUserId: userId,
      focusTokensSpent: item.costFocusTokens,
      phoneMinutesGranted: granted.phoneMinutes,
      weekendBankMinutesGranted: granted.weekendBankMinutes,
    },
  });

  return formatGrantMessage(cub, granted);
}

export async function createRewardStoreItemAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const parsed = parseRewardItemFormData(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await db.rewardStoreItem.create({
    data: {
      familyId: family.id,
      ...rewardItemUpdateData(parsed.data),
    },
  });

  revalidatePath("/dashboard/rewards");
  return { success: "Reward added to the store." };
}

function parseRewardItemFormData(formData: FormData) {
  return rewardItemSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    costFocusTokens: formData.get("costFocusTokens"),
    grantType: formData.get("grantType") || "NONE",
    minutesGranted: formData.get("minutesGranted") || undefined,
  });
}

function rewardItemUpdateData(
  data: z.infer<typeof rewardItemSchema>,
): Pick<
  RewardStoreItem,
  "title" | "description" | "costFocusTokens" | "grantType" | "minutesGranted"
> {
  return {
    title: data.title,
    description: data.description ?? null,
    costFocusTokens: data.costFocusTokens,
    grantType: data.grantType,
    minutesGranted:
      data.grantType === "NONE" || data.grantType === "FOCUS_AREA_SWAP"
        ? null
        : data.minutesGranted ?? null,
  };
}

function revalidateRewardStorePaths() {
  revalidatePath("/dashboard/rewards");
  revalidatePath("/dashboard");
}

export async function updateRewardStoreItemAction(
  itemId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const item = await db.rewardStoreItem.findFirst({
    where: { id: itemId, familyId: family.id },
  });

  if (!item) {
    return { error: "Reward not found." };
  }

  const parsed = parseRewardItemFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await db.rewardStoreItem.update({
    where: { id: item.id },
    data: rewardItemUpdateData(parsed.data),
  });

  revalidateRewardStorePaths();
  for (const cub of family.cubs) {
    revalidateRewardPaths(cub.id);
  }

  return { success: `"${parsed.data.title}" updated.` };
}

export async function setRewardStoreItemActiveAction(
  itemId: string,
  formData: FormData,
): Promise<void> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const item = await db.rewardStoreItem.findFirst({
    where: { id: itemId, familyId: family.id },
  });

  if (!item) {
    return;
  }

  const isActive = formData.get("isActive") === "true";

  await db.rewardStoreItem.update({
    where: { id: item.id },
    data: { isActive },
  });

  revalidateRewardStorePaths();
  for (const cub of family.cubs) {
    revalidateRewardPaths(cub.id);
  }
}

export async function requestRewardRedemptionAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();

  const parsed = redeemSchema.safeParse({
    cubId: formData.get("cubId"),
    rewardStoreItemId: formData.get("rewardStoreItemId"),
  });

  if (!parsed.success) {
    return { error: "Invalid redemption request." };
  }

  const { familyId } = await requireCubForUser(parsed.data.cubId, userId);

  const item = await db.rewardStoreItem.findFirst({
    where: {
      id: parsed.data.rewardStoreItemId,
      familyId,
      isActive: true,
    },
  });

  if (!item) {
    return { error: "Reward not found." };
  }

  const available = await getCubFocusTokenBalance(parsed.data.cubId);
  if (available < item.costFocusTokens) {
    return {
      error: `You need ${item.costFocusTokens} Focus Token${item.costFocusTokens === 1 ? "" : "s"} to ask for this reward.`,
    };
  }

  const existingPending = await db.rewardRedemptionRequest.findFirst({
    where: {
      cubId: parsed.data.cubId,
      rewardStoreItemId: item.id,
      status: "PENDING",
    },
    select: { id: true },
  });

  if (existingPending) {
    return { error: "You already asked your parent for this reward." };
  }

  await db.rewardRedemptionRequest.create({
    data: {
      familyId,
      cubId: parsed.data.cubId,
      rewardStoreItemId: item.id,
      requestedByUserId: userId,
    },
  });

  revalidateRewardPaths(parsed.data.cubId);
  return {
    success: `Asked your parent for “${item.title}”! They’ll approve it from Parent’s Room.`,
  };
}

export async function approveRewardRedemptionRequestAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const parsed = requestIdSchema.safeParse({
    requestId: formData.get("requestId"),
  });

  if (!parsed.success) {
    return { error: "Invalid approval request." };
  }

  const request = await db.rewardRedemptionRequest.findFirst({
    where: {
      id: parsed.data.requestId,
      familyId: family.id,
      status: "PENDING",
    },
    include: {
      cub: true,
      rewardStoreItem: true,
    },
  });

  if (!request) {
    return { error: "Redemption request not found." };
  }

  if (!request.rewardStoreItem.isActive) {
    return { error: "That reward is no longer in the store." };
  }

  let grantMessage = "";

  try {
    await db.$transaction(async (tx) => {
      grantMessage = await executeRewardRedemption(
        request.cub,
        request.rewardStoreItem,
        userId,
        tx,
      );

      await tx.rewardRedemptionRequest.update({
        where: { id: request.id },
        data: {
          status: "APPROVED",
          reviewedAt: new Date(),
          reviewedByUserId: userId,
        },
      });
    });
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not approve this redemption.",
    };
  }

  revalidateRewardPaths(request.cubId);
  return {
    success: `Approved “${request.rewardStoreItem.title}” for ${request.cub.displayName}.${grantMessage}`,
  };
}

export async function rejectRewardRedemptionRequestAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const parsed = requestIdSchema.safeParse({
    requestId: formData.get("requestId"),
  });

  if (!parsed.success) {
    return { error: "Invalid rejection request." };
  }

  const request = await db.rewardRedemptionRequest.findFirst({
    where: {
      id: parsed.data.requestId,
      familyId: family.id,
      status: "PENDING",
    },
    include: {
      cub: { select: { displayName: true } },
      rewardStoreItem: { select: { title: true } },
    },
  });

  if (!request) {
    return { error: "Redemption request not found." };
  }

  await db.rewardRedemptionRequest.update({
    where: { id: request.id },
    data: {
      status: "REJECTED",
      reviewedAt: new Date(),
      reviewedByUserId: userId,
      reviewNote:
        formData.get("reviewNote")?.toString().trim().slice(0, 500) || null,
    },
  });

  revalidateRewardPaths(request.cubId);
  return {
    success: `Declined “${request.rewardStoreItem.title}” for ${request.cub.displayName}.`,
  };
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

  let grantMessage = "";

  try {
    await db.$transaction(async (tx) => {
      grantMessage = await executeRewardRedemption(cub, item, userId, tx);
    });
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Could not redeem this reward.",
    };
  }

  revalidateRewardPaths(cub.id);
  return {
    success: `Redeemed “${item.title}” for ${cub.displayName}.${grantMessage}`,
  };
}

export async function seedRewardStoreForFamily(familyId: string) {
  await ensureDefaultRewardStoreItems(familyId);
}
