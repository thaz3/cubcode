"use server";

import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/actions/auth";
import { db } from "@/lib/db";
import { cubProgressPath } from "@/lib/cub-progress-paths";
import { requireFamilyForUser, requireUserId } from "@/lib/session";
import { offlineTokenDealSchema } from "@/lib/validations/token-deal";

async function getCubFocusTokenBalance(cubId: string) {
  const balance = await db.focusTokenLedgerEntry.aggregate({
    where: { cubId },
    _sum: { amount: true },
  });
  return balance._sum.amount ?? 0;
}

function revalidateTokenDealPaths(cubId: string) {
  revalidatePath("/dashboard/rewards");
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/cubs/${cubId}/progress`);
  revalidatePath(cubProgressPath(cubId));
  revalidatePath(`/cub/${cubId}`);
  revalidatePath(`/cub/${cubId}/rewards`);
}

export async function recordOfflineTokenDealAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();
  const family = await requireFamilyForUser(userId);

  const parsed = offlineTokenDealSchema.safeParse({
    cubId: formData.get("cubId"),
    dealType: formData.get("dealType"),
    tokenAmount: formData.get("tokenAmount"),
    agreement: formData.get("agreement"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const cub = family.cubs.find((item) => item.id === parsed.data.cubId);
  if (!cub) {
    return { error: "Cub not found." };
  }

  const amount =
    parsed.data.dealType === "earn"
      ? parsed.data.tokenAmount
      : -parsed.data.tokenAmount;

  if (amount < 0) {
    const balance = await getCubFocusTokenBalance(cub.id);
    if (balance < parsed.data.tokenAmount) {
      return {
        error: `${cub.displayName} only has ${balance} token${balance === 1 ? "" : "s"} available.`,
      };
    }
  }

  const notePrefix =
    parsed.data.dealType === "earn" ? "Earned offline: " : "Cashed in offline: ";

  await db.focusTokenLedgerEntry.create({
    data: {
      cubId: cub.id,
      amount,
      reason: "PARENT_ADJUSTMENT",
      note: `${notePrefix}${parsed.data.agreement}`,
      createdByUserId: userId,
    },
  });

  revalidateTokenDealPaths(cub.id);

  const verb =
    parsed.data.dealType === "earn"
      ? `+${parsed.data.tokenAmount} token${parsed.data.tokenAmount === 1 ? "" : "s"} for ${cub.displayName}`
      : `-${parsed.data.tokenAmount} token${parsed.data.tokenAmount === 1 ? "" : "s"} from ${cub.displayName}`;

  return { success: `${verb} — recorded.` };
}
