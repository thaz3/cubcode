import type {
  Cub,
  FocusActivityCard,
  FocusActivityCompletion,
  Prisma,
} from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { formatFocusDeckCategoryPoints } from "@/lib/focus-deck-categories";
import { parseFocusDeckCategoryPoints } from "@/lib/focus-deck-categories";
import { creditPhoneMinutesForCub } from "@/lib/rewards";

type LedgerClient = Prisma.TransactionClient | typeof db;

export async function focusDeckRewardsAlreadyCredited(
  completionId: string,
  client: LedgerClient = db,
) {
  const existing = await client.xpLedgerEntry.findFirst({
    where: { sourceFocusActivityCompletionId: completionId },
    select: { id: true },
  });
  return Boolean(existing);
}

export async function creditApprovedFocusDeckRewards(
  completion: FocusActivityCompletion,
  card: FocusActivityCard,
  cub: Cub,
  createdByUserId: string,
  client: LedgerClient = db,
) {
  if (await focusDeckRewardsAlreadyCredited(completion.id, client)) {
    return { alreadyCredited: true as const };
  }

  const categoryPoints = parseFocusDeckCategoryPoints(card.categoryPoints) ?? {};
  const pointsLabel = formatFocusDeckCategoryPoints(categoryPoints);
  const note = `Focus card approved: ${card.title}${pointsLabel ? ` (${pointsLabel})` : ""}`;

  const baseEntry = {
    cubId: cub.id,
    sourceFocusActivityCompletionId: completion.id,
    createdByUserId,
    reason: "FOCUS_DECK_APPROVAL" as const,
  };

  if (card.xpEarned !== 0) {
    await client.xpLedgerEntry.create({
      data: {
        ...baseEntry,
        amount: card.xpEarned,
        note,
      },
    });
  }

  if (card.focusTokensEarned !== 0) {
    await client.focusTokenLedgerEntry.create({
      data: {
        ...baseEntry,
        amount: card.focusTokensEarned,
        note,
      },
    });
  }

  if (card.phoneMinutesEarned > 0) {
    await creditPhoneMinutesForCub(cub, card.phoneMinutesEarned, {
      reason: "FOCUS_DECK_APPROVAL",
      note,
      createdByUserId,
      sourceFocusActivityCompletionId: completion.id,
      client,
    });
  }

  return { alreadyCredited: false as const };
}
