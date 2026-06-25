import type { TaskProofType } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import {
  getCategorySuggestions,
  type SummerLiteSubcategory,
} from "@/lib/task-categories";

export const SUMMER_LITE_LABEL = "Get Some Sun";
export const SUMMER_LITE_FULL_LABEL = "Get Some Sun";

export type { SummerLiteSubcategory };

export { SUMMER_LITE_SUBCATEGORY_LABELS } from "@/lib/task-categories";

type SummerStarterTemplate = {
  title: string;
  description: string;
  subcategory: SummerLiteSubcategory;
  proofType: TaskProofType;
  proofPrompt: string;
  proofChecklistItems?: string[];
};

export const DEFAULT_SUMMER_TASK_TEMPLATES: SummerStarterTemplate[] = [
  {
    title: "Park exploration",
    description:
      "Visit a local park with a parent. Note the location, stay within your Cub's supervision level, and observe nature or play intentionally.",
    subcategory: "PARK",
    proofType: "CHECKLIST",
    proofPrompt: "Complete each step with a parent before submitting.",
    proofChecklistItems: [
      "A parent approved the park and supervision level",
      "I named the park or location we visited",
      "I noticed and can describe one thing about the park",
    ],
  },
  {
    title: "Library summer visit",
    description:
      "Visit your library branch with a parent. Browse, read, or attend a program. Include the library name in your proof.",
    subcategory: "LIBRARY",
    proofType: "SHORT_REFLECTION",
    proofPrompt:
      "Which library did you visit? What did you read, borrow, or learn there?",
  },
  {
    title: "Neighborhood walking observation",
    description:
      "Take a supervised walk in your neighborhood. Pay attention to landmarks, nature, or how the area is used.",
    subcategory: "WALKING_OBSERVATION",
    proofType: "SHORT_REFLECTION",
    proofPrompt:
      "Where did you walk? What did you observe that you had not noticed before?",
  },
  {
    title: "Outdoor family history moment",
    description:
      "Share a family story, photo, or tradition outside — at a porch, park, or meaningful place with a parent.",
    subcategory: "FAMILY_HISTORY_OUTDOOR",
    proofType: "SHORT_REFLECTION",
    proofPrompt:
      "Where were you? What family story or tradition did you explore and why does it matter?",
  },
  {
    title: "Creative outdoor project",
    description:
      "Make something outside with a parent: chalk art, nature collage, garden work, or another creative task you plan together.",
    subcategory: "CREATIVE_OUTDOOR",
    proofType: "PARENT_APPROVAL",
    proofPrompt:
      "A parent confirms you completed the outdoor creative project you planned together.",
  },
  {
    title: "Community service outdoors",
    description:
      "Help your community outside with a parent — cleanup, helping a neighbor, or another service task you agree on first.",
    subcategory: "COMMUNITY_SERVICE",
    proofType: "CHECKLIST",
    proofPrompt: "Complete each step with a parent before submitting.",
    proofChecklistItems: [
      "A parent approved the service task and location",
      "I completed the agreed service work",
      "I can describe how it helped someone or the community",
    ],
  },
];

export async function ensureDefaultSummerTemplates(familyId: string) {
  const count = await db.taskTemplate.count({
    where: { familyId, category: "SUMMER_LITE" },
  });

  if (count > 0) {
    return;
  }

  await db.taskTemplate.createMany({
    data: DEFAULT_SUMMER_TASK_TEMPLATES.map((template) => ({
      familyId,
      title: template.title,
      description: template.description,
      category: "SUMMER_LITE" as const,
      subcategory: template.subcategory,
      proofType: template.proofType,
      proofPrompt: template.proofPrompt,
      proofChecklistItems: template.proofChecklistItems ?? [],
    })),
  });
}

export function getSummerStarterDefaults(
  subcategory: SummerLiteSubcategory = "PARK",
) {
  const starter =
    DEFAULT_SUMMER_TASK_TEMPLATES.find(
      (template) => template.subcategory === subcategory,
    ) ?? DEFAULT_SUMMER_TASK_TEMPLATES[0]!;
  const suggestion = getCategorySuggestions("SUMMER_LITE", { subcategory });

  return {
    category: "SUMMER_LITE" as const,
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
