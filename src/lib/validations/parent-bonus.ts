import { z } from "zod";

export const PARENT_BONUS_XP_OPTIONS = [5, 10, 15, 20, 25, 30] as const;

const growthCategorySchema = z.enum([
  "CONTROL",
  "USE",
  "BUILD",
  "CHARACTER",
  "WELLNESS",
]);

export const awardParentBonusXpSchema = z.object({
  cubId: z.string().min(1, "Cub is required."),
  growthCategory: growthCategorySchema,
  amount: z.coerce
    .number()
    .refine(
      (value) =>
        PARENT_BONUS_XP_OPTIONS.includes(
          value as (typeof PARENT_BONUS_XP_OPTIONS)[number],
        ),
      { message: "Choose a bonus amount." },
    ),
  reason: z
    .string()
    .trim()
    .min(3, "Describe what they did offline (at least 3 characters).")
    .max(500, "Keep the reason under 500 characters."),
});
