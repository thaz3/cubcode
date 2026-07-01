"use client";

import { CubColorBadge } from "@/components/cub-color-dot";
import { cn } from "@/lib/utils";

type RoutineCubAssignmentFieldsProps = {
  cubs: Array<{ id: string; displayName: string }>;
  defaultSelectedCubIds?: string[];
  groupMemberIds?: string[];
  variant?: "routine" | "task";
};

export function RoutineCubAssignmentFields({
  cubs,
  defaultSelectedCubIds = [],
  groupMemberIds = [],
  variant = "routine",
}: RoutineCubAssignmentFieldsProps) {
  const selected = new Set(defaultSelectedCubIds);

  return (
    <fieldset className="space-y-3">
      <div>
        <legend className="text-sm font-medium text-cub-off-white">Assign to</legend>
        <p className="mt-1 text-xs text-cub-muted">
          {variant === "task"
            ? "Select every Cub who should get this task. You can assign to more kids later from the library."
            : "Select every Cub who should get this routine. You can add or remove kids when editing."}
        </p>
      </div>

      {groupMemberIds.map((memberId) => (
        <input key={memberId} type="hidden" name="groupMemberIds" value={memberId} />
      ))}

      <ul className="space-y-2">
        {cubs.map((cub) => (
          <li key={cub.id}>
            <label
              className={cn(
                "flex min-h-11 touch-manipulation cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition",
                selected.has(cub.id)
                  ? "border-cub-gold/40 bg-cub-gold-muted/20"
                  : "border-zinc-700 bg-cub-ebony active:border-cub-gold/20",
              )}
            >
              <input
                type="checkbox"
                name="cubIds"
                value={cub.id}
                defaultChecked={selected.has(cub.id)}
                className="size-5 shrink-0 rounded border-zinc-600"
              />
              <CubColorBadge cubId={cub.id} displayName={cub.displayName} />
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}
