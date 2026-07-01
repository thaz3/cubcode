"use client";

import type { GrowthCategory, TaskCategory } from "@/generated/prisma/client";
import { GrowthAreaFields } from "@/components/growth-area-fields";

export type TaskCategoryValues = {
  category: TaskCategory;
  subcategory?: string | null;
  growthCategory?: GrowthCategory | null;
};

type TaskCategoryFieldsProps = {
  initialValues?: Partial<TaskCategoryValues>;
};

export function TaskCategoryFields({
  initialValues,
}: TaskCategoryFieldsProps) {
  const category = initialValues?.category ?? "CHORE";
  const subcategory = initialValues?.subcategory ?? "GENERAL";

  return (
    <div className="space-y-3">
      <input type="hidden" name="category" value={category} />
      {category === "FOCUS_BLOCK" ? (
        <input type="hidden" name="growthCategory" value="" />
      ) : (
        <input type="hidden" name="subcategory" value={subcategory} />
      )}

      {category === "FOCUS_BLOCK" ? (
        <p className="text-xs text-zinc-500">
          Cub picks a growth area at session start; submits reflection + proof
          link. Weekly rewards split across required areas.
        </p>
      ) : (
        <GrowthAreaFields initialValue={initialValues?.growthCategory} />
      )}
    </div>
  );
}
