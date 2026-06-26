import { z } from "zod";
import { MAX_CHECKLIST_ITEMS } from "@/lib/task-labels";
import {
  mvpProofTypeSchema,
  taskProofConfigSchema,
  validateProofConfig,
} from "@/lib/validations/task";

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

export const challengeRewardFieldsSchema = z.object({
  xpEarned: z.coerce.number().int().min(0).max(10000),
  focusTokensEarned: z.coerce.number().int().min(0).max(100),
  phoneMinutesEarned: z.coerce.number().int().min(0).max(480),
});

export const challengeIntervalSchema = z.object({
  intervalType: z.enum(["DAILY", "WEEKDAYS", "WEEKLY", "CUSTOM"]),
  customDays: z
    .array(z.coerce.number().int().min(0).max(6))
    .optional()
    .transform((days) => (days ? [...new Set(days)].sort() : undefined)),
});

export const challengeSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(120),
    description: z.string().trim().max(2000).optional(),
  })
  .extend(challengeIntervalSchema.shape)
  .extend({
    proofType: mvpProofTypeSchema,
    proofPrompt: z.string().trim().max(2000).optional(),
    proofChecklistItems: proofChecklistItemsField,
  })
  .extend(challengeRewardFieldsSchema.shape)
  .extend({
    growthCategory: z
      .enum(["CHARACTER", "WELLNESS", "CREATIVITY", "RESPONSIBILITY", "COMMUNITY"])
      .optional(),
  });

export function validateChallengeDefinition(
  data: z.infer<typeof challengeSchema>,
): string | null {
  if (data.intervalType === "CUSTOM" && (!data.customDays || data.customDays.length === 0)) {
    return "Pick at least one day for a custom routine.";
  }

  return validateProofConfig({
    proofType: data.proofType,
    proofPrompt: data.proofPrompt,
    proofChecklistItems: data.proofChecklistItems,
  });
}

export const challengeIdSchema = z.object({
  challengeId: z.string().min(1),
});

export const challengeProgressLogIdSchema = z.object({
  logId: z.string().min(1),
});

export const checkInChallengeSchema = z.object({
  challengeId: z.string().min(1),
  completed: z
    .string()
    .optional()
    .transform((v) => v === "on" || v === "true" || v === "1"),
});

export const submitChallengeCheckInSchema = z.object({
  challengeId: z.string().min(1),
  reflection: z.string().trim().max(5000).optional(),
});

export const reviewChallengeProgressSchema = z.object({
  logId: z.string().min(1),
  reviewNote: z.string().trim().max(1000).optional(),
});

export type ChallengeProofConfig = z.infer<typeof taskProofConfigSchema>;
