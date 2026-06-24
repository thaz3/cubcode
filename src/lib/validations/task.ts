import { z } from "zod";
import { MAX_CHECKLIST_ITEMS } from "@/lib/task-labels";
import { parseDueDateFormValue } from "@/lib/task-schedule";

const optionalDueDateField = z.preprocess(
  (value) => {
    if (value == null || value === "") {
      return "";
    }
    return String(value);
  },
  z
    .string()
    .transform((value) => {
      if (!value) {
        return null;
      }
      const parsed = parseDueDateFormValue(value);
      if (!parsed.dueAt) {
        throw new Error("Use a valid due date.");
      }
      return parsed.dueAt;
    }),
);

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

export const taskProofConfigSchema = z.object({
  proofType: z.enum([
    "SHORT_REFLECTION",
    "CHECKLIST",
    "TIME_LOG",
    "PERFORMANCE_VIDEO",
    "SLIDESHOW",
  ]),
  proofPrompt: z.string().trim().max(2000).optional(),
  proofChecklistItems: proofChecklistItemsField,
});

export const taskCategoryConfigSchema = z.object({
  category: z.enum(["FOCUS_BLOCK", "SCHOOL", "CHORE", "ATTITUDE", "LEGACY_WEEKLY", "SUMMER_LITE"]),
  subcategory: z.string().trim().max(50).optional(),
  growthCategory: z
    .enum(["CONTROL", "USE", "BUILD", "CHARACTER", "WELLNESS"])
    .optional(),
});

export const taskTemplateSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(120),
    description: z.string().trim().max(2000).optional(),
  })
  .extend(taskProofConfigSchema.shape)
  .extend(taskCategoryConfigSchema.shape);

/** Same fields as a template — used when editing tasks still in the pool. */
export const availableTaskSchema = taskTemplateSchema.extend({
  dueDate: optionalDueDateField,
});

export const assignTaskSchema = z.object({
  taskId: z.string().min(1),
  cubId: z.string().min(1),
  dueDate: optionalDueDateField,
});

export function validateProofConfig(
  data: z.infer<typeof taskProofConfigSchema>,
): string | null {
  if (
    data.proofType === "CHECKLIST" &&
    (!data.proofChecklistItems || data.proofChecklistItems.length === 0)
  ) {
    return "Add at least one checklist item.";
  }
  return null;
}

export function validateCategoryConfig(
  data: z.infer<typeof taskCategoryConfigSchema>,
): string | null {
  if (data.category !== "FOCUS_BLOCK" && !data.subcategory) {
    return "Pick a type for this task category.";
  }
  return null;
}

export function validateTaskDefinition(
  data: z.infer<typeof taskTemplateSchema>,
): string | null {
  return validateCategoryConfig(data) ?? validateProofConfig(data);
}

export const createTaskFromTemplateSchema = z.object({
  templateId: z.string().min(1),
  cubId: z.string().optional(),
  dueDate: optionalDueDateField,
});

export const focusBlockSchema = z.object({
  cubId: z.string().min(1),
  taskId: z.string().optional(),
  durationMinutes: z.coerce
    .number()
    .int()
    .min(1, "Focus Block must be at least 1 minute")
    .max(240),
  startedAt: z.string().min(1),
  note: z.string().trim().max(500).optional(),
});

export const submitTaskSchema = z.object({
  taskId: z.string().min(1),
  reflection: z.string().trim().max(5000).optional(),
  proofLink: z.string().trim().max(2000).optional(),
  timeLoggedMinutes: z.coerce.number().int().min(0).max(480).optional(),
});

export const reviewTaskSchema = z.object({
  taskId: z.string().min(1),
  reviewNote: z.string().trim().max(1000).optional(),
});

/** @deprecated Use assignTaskSchema */
export const claimTaskSchema = assignTaskSchema;

export const startTaskSchema = z.object({
  taskId: z.string().min(1),
  growthCategory: z
    .enum(["CONTROL", "USE", "BUILD", "CHARACTER", "WELLNESS"])
    .optional(),
});

export const taskRewardFieldsSchema = z.object({
  focusMinutesEarned: z.coerce.number().int().min(0).max(240),
  phoneMinutesEarned: z.coerce.number().int().min(0).max(480),
  xpEarned: z.coerce.number().int().min(0).max(10000),
  focusTokensEarned: z.coerce.number().int().min(0).max(100),
});

export const taskIdSchema = z.object({
  taskId: z.string().min(1),
});
