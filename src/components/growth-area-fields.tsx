"use client";

import type { GrowthCategory } from "@/generated/prisma/client";
import { Label } from "@/components/ui/label";
import { growthCategoryOptions } from "@/lib/task-categories";
import { NATIVE_SELECT_CLASS } from "@/lib/mobile-form-styles";

type GrowthAreaFieldsProps = {
  initialValue?: GrowthCategory | null;
  name?: string;
  id?: string;
};

export function GrowthAreaFields({
  initialValue = null,
  name = "growthCategory",
  id = "growthCategory",
}: GrowthAreaFieldsProps) {
  const options = growthCategoryOptions();

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>Growth area (optional)</Label>
      <p className="text-xs text-cub-muted">
        Tag this work so it counts toward weekly growth charts. Leave blank if it
        should not appear on the graph.
      </p>
      <select
        id={id}
        name={name}
        defaultValue={initialValue ?? ""}
        className={NATIVE_SELECT_CLASS}
      >
        <option value="">No growth area</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
