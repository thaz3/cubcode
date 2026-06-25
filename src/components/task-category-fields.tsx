"use client";

import type { GrowthCategory, TaskCategory } from "@/generated/prisma/client";
import {
  getCategorySuggestions,
  subcategoryOptions,
  TASK_CATEGORY_LABELS,
  type CategorySuggestion,
} from "@/lib/task-categories";
import { Button } from "@/components/ui/button";
import { GrowthAreaFields } from "@/components/growth-area-fields";
import { RadioChoiceList } from "@/components/ui/radio-choice-list";
import { useMemo, useState } from "react";

const TASK_CATEGORIES = Object.keys(TASK_CATEGORY_LABELS) as TaskCategory[];

export type TaskCategoryValues = {
  category: TaskCategory;
  subcategory?: string | null;
  growthCategory?: GrowthCategory | null;
};

type TaskCategoryFieldsProps = {
  initialValues?: Partial<TaskCategoryValues>;
  onApplySuggested?: (suggestion: CategorySuggestion) => void;
};

export function TaskCategoryFields({
  initialValues,
  onApplySuggested,
}: TaskCategoryFieldsProps) {
  const [category, setCategory] = useState<TaskCategory>(
    initialValues?.category ?? "CHORE",
  );
  const [subcategory, setSubcategory] = useState(
    initialValues?.subcategory ?? "GENERAL",
  );
  const [message, setMessage] = useState<string | null>(null);

  const suggestion = useMemo(
    () =>
      getCategorySuggestions(category, {
        subcategory: category === "FOCUS_BLOCK" ? null : subcategory,
        growthCategory: null,
      }),
    [category, subcategory],
  );

  function handleCategoryChange(next: TaskCategory) {
    setCategory(next);
    if (next === "SCHOOL") {
      setSubcategory("HOMEWORK");
    } else if (next === "CHORE") {
      setSubcategory("GENERAL");
    } else if (next === "ATTITUDE") {
      setSubcategory("RESPECTFUL");
    } else if (next === "LEGACY_WEEKLY") {
      setSubcategory("HISTORICAL_FIGURE");
    } else if (next === "SUMMER_LITE") {
      setSubcategory("PARK");
    }
  }

  function applySuggestedSettings() {
    onApplySuggested?.(suggestion);
    setMessage("Suggested proof and log settings applied for this category.");
  }

  return (
    <div className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50/50 p-3 dark:border-zinc-700 dark:bg-zinc-900/50">
      <input type="hidden" name="category" value={category} />
      {category === "FOCUS_BLOCK" ? (
        <input type="hidden" name="growthCategory" value="" />
      ) : (
        <input type="hidden" name="subcategory" value={subcategory} />
      )}

      <div className="space-y-1.5">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Category
        </p>
        <RadioChoiceList
          name="categoryChoice"
          value={category}
          onChange={handleCategoryChange}
          layout="compact"
          options={TASK_CATEGORIES.map((value) => ({
            value,
            label: TASK_CATEGORY_LABELS[value],
          }))}
        />
      </div>

      {category === "FOCUS_BLOCK" ? (
        <p className="text-xs text-zinc-500">
          Cub picks a growth area at session start; submits reflection + proof
          link. Weekly rewards split across required areas.
        </p>
      ) : (
        <>
          <div className="space-y-1.5">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Type
            </p>
            <RadioChoiceList
              name="subcategoryChoice"
              value={subcategory}
              onChange={setSubcategory}
              layout="compact"
              options={subcategoryOptions(category)}
            />
          </div>
          <GrowthAreaFields initialValue={initialValues?.growthCategory} />
        </>
      )}

      <div className="rounded-lg border border-amber-200/80 bg-amber-50/60 px-3 py-2 text-xs dark:border-amber-900 dark:bg-amber-950/30">
        <p className="text-zinc-600 dark:text-zinc-400">
          {suggestion.logInstructions}
        </p>
        <p className="mt-1 text-zinc-500">
          Suggested: {suggestion.focusMinutesEarned} focus min ·{" "}
          {suggestion.phoneMinutesEarned} phone · {suggestion.xpEarned} XP ·{" "}
          {suggestion.focusTokensEarned} token
          {suggestion.focusTokensEarned === 1 ? "" : "s"}
        </p>
      </div>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={applySuggestedSettings}
      >
        Use suggested proof settings
      </Button>
      {message ? (
        <p className="text-xs text-green-700 dark:text-green-400">{message}</p>
      ) : null}
    </div>
  );
}
