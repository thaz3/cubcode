import type { FocusActivityCard } from "@/generated/prisma/client";

export function getCardChecklistItems(
  card: Pick<FocusActivityCard, "proofChecklistItems">,
): string[] {
  if (!Array.isArray(card.proofChecklistItems)) {
    return [];
  }
  return card.proofChecklistItems
    .map((item) => String(item).trim())
    .filter(Boolean);
}
