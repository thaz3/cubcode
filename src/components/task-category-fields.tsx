"use client";

import type { GrowthCategory, TaskCategory } from "@/generated/prisma/client";
import {
  getCategorySuggestions,
  growthCategoryOptions,
  subcategoryOptions,
  TASK_CATEGORY_LABELS,
  type CategorySuggestion,
} from "@/lib/task-categories";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
  const [growthCategory, setGrowthCategory] = useState<GrowthCategory>(
    initialValues?.growthCategory ?? "CONTROL",
  );
  const [message, setMessage] = useState<string | null>(null);

  const suggestion = useMemo(
    () =>
      getCategorySuggestions(category, {
        subcategory: category === "FOCUS_BLOCK" ? null : subcategory,
        growthCategory: category === "FOCUS_BLOCK" ? growthCategory : null,
      }),
    [category, subcategory, growthCategory],
  );

  function handleCategoryChange(next: TaskCategory) {
    setCategory(next);
    if (next === "FOCUS_BLOCK") {
      setGrowthCategory("CONTROL");
    } else if (next === "SCHOOL") {
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
    <div className="space-y-4 rounded-lg border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-900/50">
      <div>
        <h4 className="text-sm font-medium">Task category</h4>
        <p className="mt-1 text-sm text-zinc-500">
          Each category has its own logging style and suggested rewards.
        </p>
      </div>

      <input type="hidden" name="category" value={category} />
      {category === "FOCUS_BLOCK" ? (
        <input type="hidden" name="growthCategory" value={growthCategory} />
      ) : (
        <input type="hidden" name="subcategory" value={subcategory} />
      )}

      <div>
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          value={category}
          onChange={(e) =>
            handleCategoryChange(e.target.value as TaskCategory)
          }
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          {TASK_CATEGORIES.map((value) => (
            <option key={value} value={value}>
              {TASK_CATEGORY_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      {category === "FOCUS_BLOCK" ? (
        <div>
          <Label htmlFor="growthCategory">Growth area</Label>
          <p className="mt-1 text-xs text-zinc-500">
            One of the five C.U.B. growth categories for Focus Blocks.
          </p>
          <select
            id="growthCategory"
            value={growthCategory}
            onChange={(e) =>
              setGrowthCategory(e.target.value as GrowthCategory)
            }
            className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          >
            {growthCategoryOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          <Label htmlFor="subcategory">Type</Label>
          <select
            id="subcategory"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          >
            {subcategoryOptions(category).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="rounded-lg border border-amber-200/80 bg-amber-50/60 p-3 text-sm dark:border-amber-900 dark:bg-amber-950/30">
        <p className="font-medium text-zinc-800 dark:text-zinc-200">
          How to log this task
        </p>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          {suggestion.logInstructions}
        </p>
        <p className="mt-2 text-xs text-zinc-500">
          Suggested rewards: {suggestion.focusMinutesEarned} focus min ·{" "}
          {suggestion.phoneMinutesEarned} phone min · {suggestion.xpEarned} XP ·{" "}
          {suggestion.focusTokensEarned} Focus Token
          {suggestion.focusTokensEarned === 1 ? "" : "s"}
          {" "}(applied when task is created; Cub profile overrides on assign)
        </p>
      </div>

      <Button type="button" variant="secondary" onClick={applySuggestedSettings}>
        Use suggested proof settings
      </Button>
      {message ? (
        <p className="text-sm text-green-700 dark:text-green-400">{message}</p>
      ) : null}
    </div>
  );
}
