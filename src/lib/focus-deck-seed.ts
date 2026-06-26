import { db } from "@/lib/db";
import { FOCUS_DECK_STARTER_CARDS } from "@/lib/focus-deck-starter-cards";

export async function ensureFocusDeckStarterCards(
  familyId: string,
  createdByUserId?: string,
) {
  for (const starter of FOCUS_DECK_STARTER_CARDS) {
    const existing = await db.focusActivityCard.findFirst({
      where: { familyId, starterKey: starter.key },
      select: { id: true },
    });

    if (existing) continue;

    await db.focusActivityCard.create({
      data: {
        familyId,
        createdByUserId: createdByUserId ?? null,
        starterKey: starter.key,
        title: starter.title,
        description: starter.description,
        instructions: starter.instructions,
        estimatedMinutes: starter.estimatedMinutes,
        locationType: starter.locationType,
        difficulty: starter.difficulty,
        categoryPoints: starter.categoryPoints,
        proofType: starter.proofType,
        proofPrompt: starter.proofPrompt,
        proofChecklistItems:
          starter.proofType === "CHECKLIST"
            ? [
                "Room is clean and organized",
                "I explained one habit to keep it clean",
              ]
            : undefined,
        xpEarned: starter.xpEarned,
        focusTokensEarned: starter.focusTokensEarned,
        phoneMinutesEarned: starter.phoneMinutesEarned,
        focusMinutesEarned: starter.focusMinutesEarned,
        status: "ACTIVE",
      },
    });
  }
}
