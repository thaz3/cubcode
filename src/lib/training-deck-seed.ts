import { db } from "@/lib/db";
import { TRAINING_DECK_DEFINITIONS } from "@/lib/training-deck-definitions";

export async function ensureTrainingBoardSeeded(familyId: string) {
  for (const deckDef of TRAINING_DECK_DEFINITIONS) {
    const deck = await db.trainingDeck.upsert({
      where: {
        familyId_slug: { familyId, slug: deckDef.slug },
      },
      create: {
        familyId,
        slug: deckDef.slug,
        milestoneNumber: deckDef.milestoneNumber,
        title: deckDef.title,
        description: deckDef.description,
        sortOrder: deckDef.milestoneNumber,
      },
      update: {
        milestoneNumber: deckDef.milestoneNumber,
        title: deckDef.title,
        description: deckDef.description,
        sortOrder: deckDef.milestoneNumber,
      },
    });

    for (const [index, cardDef] of deckDef.cards.entries()) {
      const starterKey = `${deckDef.slug}:${cardDef.key}`;
      await db.focusActivityCard.upsert({
        where: {
          familyId_starterKey: { familyId, starterKey },
        },
        create: {
          familyId,
          trainingDeckId: deck.id,
          sortOrder: index,
          starterKey,
          status: "ACTIVE",
          title: cardDef.title,
          description: cardDef.description,
          instructions: cardDef.instructions,
          estimatedMinutes: cardDef.estimatedMinutes,
          locationType: cardDef.locationType,
          difficulty: cardDef.difficulty,
          categoryPoints: cardDef.categoryPoints,
          proofType: cardDef.proofType,
          proofPrompt: cardDef.proofPrompt,
          xpEarned: cardDef.xpEarned ?? 12,
          focusTokensEarned: cardDef.focusTokensEarned ?? 1,
          phoneMinutesEarned: cardDef.phoneMinutesEarned ?? 12,
          focusMinutesEarned: cardDef.focusMinutesEarned ?? 25,
        },
        update: {
          trainingDeckId: deck.id,
          sortOrder: index,
          status: "ACTIVE",
          title: cardDef.title,
          description: cardDef.description,
          instructions: cardDef.instructions,
          estimatedMinutes: cardDef.estimatedMinutes,
          locationType: cardDef.locationType,
          difficulty: cardDef.difficulty,
          categoryPoints: cardDef.categoryPoints,
          proofType: cardDef.proofType,
          proofPrompt: cardDef.proofPrompt,
        },
      });
    }
  }
}

export async function getTrainingDecksForFamily(familyId: string) {
  return db.trainingDeck.findMany({
    where: { familyId },
    orderBy: { sortOrder: "asc" },
    include: {
      cards: {
        where: { status: "ACTIVE" },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}
