import type { Task, TaskTemplate } from "@/generated/prisma/client";
import { getCategorySuggestions } from "@/lib/task-categories";

export function templateProofFields(template: TaskTemplate) {
  return {
    proofType: template.proofType,
    proofPrompt: template.proofPrompt,
    proofChecklistItems: template.proofChecklistItems ?? undefined,
  };
}

export function templateCategoryFields(template: TaskTemplate | Task) {
  return {
    category: template.category,
    subcategory: template.subcategory,
    growthCategory: template.growthCategory,
  };
}

export function categoryRewardFields(
  category: Task["category"],
  options?: {
    subcategory?: string | null;
    growthCategory?: Task["growthCategory"];
  },
) {
  const suggested = getCategorySuggestions(category, options);
  return {
    focusMinutesEarned: suggested.focusMinutesEarned,
    phoneMinutesEarned: suggested.phoneMinutesEarned,
    xpEarned: suggested.xpEarned,
    focusTokensEarned: suggested.focusTokensEarned,
  };
}

export const DEFAULT_TASK_REWARDS = categoryRewardFields("CHORE", {
  subcategory: "GENERAL",
});

export function templateTaskFields(template: TaskTemplate) {
  return {
    ...templateCategoryFields(template),
    ...templateProofFields(template),
    recurrence: template.recurrence,
    recurrenceConfig: template.recurrenceConfig ?? undefined,
    ...categoryRewardFields(template.category, {
      subcategory: template.subcategory,
      growthCategory: template.growthCategory,
    }),
  };
}
