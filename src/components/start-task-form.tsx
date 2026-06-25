"use client";

import { useActionState, useState } from "react";
import { startTaskAction } from "@/lib/actions/tasks";
import { Button } from "@/components/ui/button";
import { RadioChoiceList } from "@/components/ui/radio-choice-list";
import type { GrowthCategory } from "@/generated/prisma/client";
import type { ActionState } from "@/lib/actions/auth";

type GrowthOption = {
  value: GrowthCategory;
  label: string;
};

type StartTaskFormProps = {
  taskId: string;
  isFocusBlock: boolean;
  isResubmit?: boolean;
  availableGrowthAreas?: GrowthOption[];
  weekProgressLabel?: string;
};

export function StartTaskForm({
  taskId,
  isFocusBlock,
  isResubmit = false,
  availableGrowthAreas = [],
  weekProgressLabel,
}: StartTaskFormProps) {
  const [growthCategory, setGrowthCategory] = useState<GrowthCategory | "">(
    availableGrowthAreas[0]?.value ?? "",
  );
  const [state, formAction, isPending] = useActionState(
    startTaskAction,
    {} as ActionState,
  );

  if (isFocusBlock && availableGrowthAreas.length === 0) {
    return (
      <p className="rounded-xl bg-amber-950/40 px-3 py-2 text-sm text-amber-200">
        You finished every growth area this week. Nice work — ask your parent
        what&apos;s next or come back next week.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="taskId" value={taskId} />
      {isFocusBlock ? (
        <input type="hidden" name="growthCategory" value={growthCategory} />
      ) : null}

      {isFocusBlock ? (
        <>
          {weekProgressLabel ? (
            <p className="text-sm text-zinc-400">{weekProgressLabel}</p>
          ) : null}
          <p className="text-sm font-medium text-zinc-200">
            Pick a growth area for this session
          </p>
          <RadioChoiceList
            name={`growth-${taskId}`}
            value={growthCategory}
            onChange={setGrowthCategory}
            options={availableGrowthAreas}
          />
        </>
      ) : null}

      {state.error ? (
        <p className="text-sm text-red-400">{state.error}</p>
      ) : null}

      <Button
        type="submit"
        variant="constructive"
        fullWidth
        size="lg"
        disabled={isPending || (isFocusBlock && !growthCategory)}
      >
        {isPending
          ? "Opening..."
          : isResubmit
            ? "View instructions again"
            : isFocusBlock
              ? "View instructions"
              : "View instructions"}
      </Button>
    </form>
  );
}
