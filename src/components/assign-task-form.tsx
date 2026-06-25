"use client";

import { TaskUrgentField } from "@/components/task-urgent-field";
import { TaskDueDateField, useDueDateFormAction } from "@/components/task-due-date-field";
import { Button } from "@/components/ui/button";
import { RadioChoiceList } from "@/components/ui/radio-choice-list";
import type { ActionState } from "@/lib/actions/auth";
import { assignTaskAction } from "@/lib/actions/tasks";
import { useState } from "react";

type AssignTaskFormProps = {
  taskId: string;
  cubs: Array<{ id: string; displayName: string }>;
  submitLabel?: string;
};

export function AssignTaskForm({
  taskId,
  cubs,
  submitLabel = "Assign task",
}: AssignTaskFormProps) {
  const { state, formAction, isPending, onDueDateChange } = useDueDateFormAction(
    assignTaskAction,
    {} as ActionState,
  );

  if (cubs.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        Add a Cub profile before assigning tasks.
      </p>
    );
  }

  const [cubId, setCubId] = useState(cubs[0]?.id ?? "");

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="taskId" value={taskId} />
      <input type="hidden" name="cubId" value={cubId} />

      <div>
        <p className="mb-2 text-sm font-medium">Assign to child</p>
        <p className="mb-2 text-sm text-zinc-500">
          Choose which Cub this task is for. Their reward settings apply once
          you assign it. Cubs do not pick tasks from the board — parents assign
          them.
        </p>
        <RadioChoiceList
          name={`assign-cub-${taskId}`}
          value={cubId}
          onChange={setCubId}
          options={cubs.map((cub) => ({
            value: cub.id,
            label: cub.displayName,
          }))}
        />
      </div>

      <TaskDueDateField
        id={`assign-due-${taskId}`}
        onDueDateChange={onDueDateChange}
        showQuickDue
      />

      <TaskUrgentField id={`assign-urgent-${taskId}`} />

      {state.error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-green-700 dark:text-green-400">
          {state.success}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending || !cubId}>
        {isPending ? "Assigning..." : submitLabel}
      </Button>
    </form>
  );
}

/** @deprecated Use AssignTaskForm */
export const ClaimTaskForm = AssignTaskForm;
