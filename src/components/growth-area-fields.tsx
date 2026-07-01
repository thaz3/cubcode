"use client";

import { useState } from "react";
import type { GrowthCategory } from "@/generated/prisma/client";
import { Label } from "@/components/ui/label";
import {
  growthCategoryDescription,
  growthCategoryOptions,
  growthCategoryShortLabel,
} from "@/lib/task-categories";
import { NATIVE_SELECT_CLASS } from "@/lib/mobile-form-styles";

type GrowthAreaFieldsProps = {
  initialValue?: GrowthCategory | null;
  name?: string;
  id?: string;
  required?: boolean;
};

export function GrowthAreaFields({
  initialValue = null,
  name = "growthCategory",
  id = "growthCategory",
  required = true,
}: GrowthAreaFieldsProps) {
  const options = growthCategoryOptions();
  const [selected, setSelected] = useState<GrowthCategory | "">(
    initialValue ?? "",
  );

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        Cub Code{required ? "" : " (optional)"}
      </Label>
      <p className="text-xs text-cub-muted">
        {required
          ? "Pick which Cub Code this assignment counts toward on growth charts."
          : "Tag this work so it counts toward weekly growth charts. Leave blank if it should not appear on the graph."}
      </p>
      <select
        id={id}
        name={name}
        value={selected}
        onChange={(event) =>
          setSelected(event.target.value as GrowthCategory | "")
        }
        required={required}
        className={NATIVE_SELECT_CLASS}
      >
        {!required ? <option value="">No Cub Code</option> : null}
        {required ? (
          <option value="" disabled hidden>
            Select a Cub Code
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {selected ? (
        <p className="rounded-lg border border-cub-charcoal bg-cub-ebony/40 px-3 py-2 text-xs leading-relaxed text-cub-muted">
          <span className="font-semibold text-cub-off-white">
            {growthCategoryShortLabel(selected)}:{" "}
          </span>
          {growthCategoryDescription(selected)}
        </p>
      ) : null}
    </div>
  );
}
