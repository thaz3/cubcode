import type { TaskProofType } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import {
  getCategorySuggestions,
  type LegacyWeeklySubcategory,
} from "@/lib/task-categories";

export const LEGACY_WEEKLY_LABEL = "Weekly Legacy";

export type { LegacyWeeklySubcategory };

export { LEGACY_WEEKLY_SUBCATEGORY_LABELS } from "@/lib/task-categories";

type LegacyStarterTemplate = {
  title: string;
  description: string;
  subcategory: LegacyWeeklySubcategory;
  proofType: TaskProofType;
  proofPrompt: string;
  proofChecklistItems?: string[];
};

export const DEFAULT_LEGACY_TASK_TEMPLATES: LegacyStarterTemplate[] = [
  {
    title: "Learn about a Black historical figure",
    description:
      "Pick someone to study this week — from a book, documentary, museum, or conversation with a parent.",
    subcategory: "HISTORICAL_FIGURE",
    proofType: "SHORT_REFLECTION",
    proofPrompt:
      "Who did you learn about? Share two facts and one lesson you take from their life.",
  },
  {
    title: "Interview a family elder",
    description:
      "Talk with a grandparent, aunt, uncle, neighbor, or elder in your community. Ask about their story.",
    subcategory: "ELDER_INTERVIEW",
    proofType: "SHORT_REFLECTION",
    proofPrompt:
      "Who did you interview? What story or advice will you remember and why?",
  },
  {
    title: "Research a Black inventor, artist, or organizer",
    description:
      "Choose someone who built, created, or led — in science, arts, sports, business, or community work.",
    subcategory: "INVENTOR_ARTIST_ORGANIZER",
    proofType: "SHORT_REFLECTION",
    proofPrompt:
      "Who did you research? What did they create or change, and how does that inspire you?",
  },
  {
    title: "Visit or observe a community location",
    description:
      "Visit a library, park, mural, church, business, or landmark in your neighborhood with a parent.",
    subcategory: "COMMUNITY_LOCATION",
    proofType: "CHECKLIST",
    proofPrompt: "Complete each step with a parent before submitting.",
    proofChecklistItems: [
      "I visited the location with parent supervision",
      "I noticed something meaningful about the place or people there",
      "I can name one way this place matters to our community",
    ],
  },
  {
    title: "Reflect on your family history",
    description:
      "Look at photos, recipes, traditions, or stories that connect your family across generations.",
    subcategory: "FAMILY_HISTORY",
    proofType: "SHORT_REFLECTION",
    proofPrompt:
      "What family story, tradition, or value did you explore? Why does it matter to you?",
  },
  {
    title: "Connect history to responsibility today",
    description:
      "Think about how lessons from Black history or family legacy apply to how you act this week.",
    subcategory: "PRESENT_DAY_RESPONSIBILITY",
    proofType: "SHORT_REFLECTION",
    proofPrompt:
      "What responsibility are you carrying forward? Give one example of how you showed it this week.",
  },
];

export async function ensureDefaultLegacyTemplates(familyId: string) {
  const count = await db.taskTemplate.count({
    where: { familyId, category: "LEGACY_WEEKLY" },
  });

  if (count > 0) {
    return;
  }

  await db.taskTemplate.createMany({
    data: DEFAULT_LEGACY_TASK_TEMPLATES.map((template) => ({
      familyId,
      title: template.title,
      description: template.description,
      category: "LEGACY_WEEKLY" as const,
      subcategory: template.subcategory,
      proofType: template.proofType,
      proofPrompt: template.proofPrompt,
      proofChecklistItems: template.proofChecklistItems ?? [],
    })),
  });
}

export function getLegacyStarterDefaults(
  subcategory: LegacyWeeklySubcategory = "HISTORICAL_FIGURE",
) {
  const starter =
    DEFAULT_LEGACY_TASK_TEMPLATES.find(
      (template) => template.subcategory === subcategory,
    ) ?? DEFAULT_LEGACY_TASK_TEMPLATES[0]!;
  const suggestion = getCategorySuggestions("LEGACY_WEEKLY", { subcategory });

  return {
    category: "LEGACY_WEEKLY" as const,
    subcategory,
    title: starter.title,
    description: starter.description,
    proofType: starter.proofType,
    proofPrompt: starter.proofPrompt,
    proofChecklistItems: starter.proofChecklistItems,
    focusMinutesEarned: suggestion.focusMinutesEarned,
    phoneMinutesEarned: suggestion.phoneMinutesEarned,
    xpEarned: suggestion.xpEarned,
    focusTokensEarned: suggestion.focusTokensEarned,
    logInstructions: suggestion.logInstructions,
  };
}
