"use client";

import type { TaskRecurrence } from "@/generated/prisma/client";
import { RadioChoiceList } from "@/components/ui/radio-choice-list";
import { TASK_RECURRENCE_OPTIONS } from "@/lib/task-recurrence";
import { useState } from "react";

type TaskRecurrenceFieldProps = {
  initialValue?: TaskRecurrence;
};

export function TaskRecurrenceField({
  initialValue = "NONE",
}: TaskRecurrenceFieldProps) {
  const [recurrence, setRecurrence] = useState<TaskRecurrence>(initialValue);

  return (
    <div className="space-y-1.5">
      <input type="hidden" name="recurrence" value={recurrence} />
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        Repeat
      </p>
      <RadioChoiceList
        name="recurrenceChoice"
        value={recurrence}
        onChange={setRecurrence}
        layout="compact"
        options={TASK_RECURRENCE_OPTIONS}
      />
      {recurrence !== "NONE" ? (
        <p className="text-xs text-zinc-500">
          When approved, the next occurrence is assigned automatically with an
          updated due date.
        </p>
      ) : null}
    </div>
  );
}
