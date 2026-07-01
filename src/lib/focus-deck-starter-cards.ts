import type { FocusDeckDifficulty, FocusDeckLocationType, TaskProofType } from "@/generated/prisma/client";
import type { FocusDeckCategoryPoints } from "@/lib/focus-deck-categories";

export type FocusDeckStarterCard = {
  key: string;
  title: string;
  description: string;
  instructions: string;
  estimatedMinutes: number;
  locationType: FocusDeckLocationType;
  difficulty: FocusDeckDifficulty;
  categoryPoints: FocusDeckCategoryPoints;
  proofType: TaskProofType;
  proofPrompt: string;
  xpEarned: number;
  focusTokensEarned: number;
  phoneMinutesEarned: number;
  focusMinutesEarned: number;
};

export const FOCUS_DECK_STARTER_CARDS: FocusDeckStarterCard[] = [
  {
    key: "walk-witness",
    title: "Walk + Witness",
    description: "Move your body, then capture what you noticed.",
    instructions:
      "Walk 2 miles at a park. Then sit somewhere and draw, write, or journal what you noticed.",
    estimatedMinutes: 60,
    locationType: "OUTDOOR",
    difficulty: "MEDIUM",
    categoryPoints: { BODY: 2, CREATIVITY: 2, CHARACTER: 1 },
    proofType: "SHORT_REFLECTION",
    proofPrompt: "What did you notice on your walk? Share a short reflection or photo of your journal/sketch.",
    xpEarned: 15,
    focusTokensEarned: 1,
    phoneMinutesEarned: 15,
    focusMinutesEarned: 30,
  },
  {
    key: "elder-performance",
    title: "Elder Performance",
    description: "Create something meaningful for an elder family member.",
    instructions:
      "Create a 1-minute performance piece, poem, dance, speech, or song for an elder family member.",
    estimatedMinutes: 45,
    locationType: "HOME",
    difficulty: "CHALLENGING",
    categoryPoints: {
      CREATIVITY: 3,
      FAMILY: 2,
      RESPONSIBILITY: 1,
      CHARACTER: 2,
      BODY: 1,
    },
    proofType: "PARENT_APPROVAL",
    proofPrompt: "Parent confirms the performance was shared, or Cub writes a short reflection.",
    xpEarned: 20,
    focusTokensEarned: 2,
    phoneMinutesEarned: 20,
    focusMinutesEarned: 45,
  },
  {
    key: "room-reset",
    title: "Room Reset",
    description: "Reset your space and name one habit to keep it clean.",
    instructions:
      "Clean your room and explain one habit that would help keep it clean.",
    estimatedMinutes: 30,
    locationType: "HOME",
    difficulty: "EASY",
    categoryPoints: { RESPONSIBILITY: 3, CHARACTER: 2 },
    proofType: "CHECKLIST",
    proofPrompt: "Check off each step and explain your keep-it-clean habit.",
    xpEarned: 12,
    focusTokensEarned: 1,
    phoneMinutesEarned: 12,
    focusMinutesEarned: 25,
  },
  {
    key: "family-interview",
    title: "Family Interview",
    description: "Learn from an elder through thoughtful questions.",
    instructions: "Ask an elder 5 questions and summarize what you learned.",
    estimatedMinutes: 40,
    locationType: "ANY",
    difficulty: "MEDIUM",
    categoryPoints: { FAMILY: 3, CHARACTER: 2, CREATIVITY: 1 },
    proofType: "SHORT_REFLECTION",
    proofPrompt: "Write a short summary of what you learned from the interview.",
    xpEarned: 15,
    focusTokensEarned: 1,
    phoneMinutesEarned: 15,
    focusMinutesEarned: 30,
  },
];
