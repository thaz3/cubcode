import { z } from "zod";
import { MAX_CHECKLIST_ITEMS } from "@/lib/task-labels";
import {
  mvpProofTypeSchema,
  validateProofConfig,
} from "@/lib/validations/task";
import {
  ALL_FOCUS_DECK_CATEGORIES,
  parseFocusDeckCategoryPoints,
} from "@/lib/focus-deck-categories";

const proofChecklistItemsField = z
  .string()
  .optional()
  .transform((val) => {
    if (!val?.trim()) return undefined;
    try {
      const parsed = JSON.parse(val) as unknown;
      if (!Array.isArray(parsed)) return undefined;
      return parsed
        .map((item) => String(item).trim())
        .filter(Boolean)
        .slice(0, MAX_CHECKLIST_ITEMS);
    } catch {
      return undefined;
    }
  });

export const focusDeckRewardFieldsSchema = z.object({
  xpEarned: z.coerce.number().int().min(0).max(10000),
  focusTokensEarned: z.coerce.number().int().min(0).max(100),
  phoneMinutesEarned: z.coerce.number().int().min(0).max(480),
  focusMinutesEarned: z.coerce.number().int().min(0).max(480),
});

export const focusActivityCardSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(120),
    description: z.string().trim().max(2000).optional(),
    instructions: z.string().trim().max(4000).optional(),
    estimatedMinutes: z.coerce.number().int().min(5).max(480).optional(),
    locationType: z.enum(["HOME", "OUTDOOR", "COMMUNITY", "ANY"]).optional(),
    difficulty: z.enum(["EASY", "MEDIUM", "CHALLENGING"]).optional(),
    proofType: mvpProofTypeSchema,
    proofPrompt: z.string().trim().max(2000).optional(),
    proofChecklistItems: proofChecklistItemsField,
    publish: z.enum(["true", "false"]).optional(),
  })
  .extend(focusDeckRewardFieldsSchema.shape);

export function validateFocusActivityCardDefinition(
  data: z.infer<typeof focusActivityCardSchema>,
  categoryPoints: ReturnType<typeof parseFocusDeckCategoryPoints>,
): string | null {
  if (!categoryPoints || Object.keys(categoryPoints).length === 0) {
    return "Add at least one growth area point.";
  }

  for (const category of ALL_FOCUS_DECK_CATEGORIES) {
    const points = categoryPoints[category];
    if (points != null && (points < 1 || points > 10)) {
      return "Category points must be between 1 and 10.";
    }
  }

  return validateProofConfig({
    proofType: data.proofType,
    proofPrompt: data.proofPrompt,
    proofChecklistItems: data.proofChecklistItems,
  });
}

export const focusActivityCardIdSchema = z.object({
  cardId: z.string().min(1),
});

export const focusActivityCompletionIdSchema = z.object({
  completionId: z.string().min(1),
});

export const focusDeckStackSchema = z.object({
  cardId: z.string().min(1),
  cubId: z.string().min(1),
});

export const submitFocusCompletionSchema = z.object({
  completionId: z.string().min(1),
  reflection: z.string().trim().max(4000).optional(),
  proofLink: z.string().trim().max(2000).optional(),
  timeLoggedMinutes: z.coerce.number().int().min(1).max(480).optional(),
});

export const reviewFocusCompletionSchema = z.object({
  completionId: z.string().min(1),
  reviewNote: z.string().trim().max(2000).optional(),
});
