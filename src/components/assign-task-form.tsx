"use client";

import { TaskDueDateField, useDueDateFormAction } from "@/components/task-due-date-field";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { ActionState } from "@/lib/actions/auth";
import { assignTaskAction } from "@/lib/actions/tasks";

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

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="taskId" value={taskId} />

      <div>
        <Label htmlFor={`assign-cub-${taskId}`}>Assign to child</Label>
        <p className="mt-1 text-sm text-zinc-500">
          Choose which Cub this task is for. Their reward settings apply once
          you assign it. Cubs do not pick tasks from the board — parents assign
          them.
        </p>
        <select
          id={`assign-cub-${taskId}`}
          name="cubId"
          required
          defaultValue=""
          className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="" disabled>
            Select a Cub…
          </option>
          {cubs.map((cub) => (
            <option key={cub.id} value={cub.id}>
              {cub.displayName}
            </option>
          ))}
        </select>
      </div>

      <TaskDueDateField
        id={`assign-due-${taskId}`}
        onDueDateChange={onDueDateChange}
        showQuickDue
      />

      {state.error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-green-700 dark:text-green-400">
          {state.success}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Assigning..." : submitLabel}
      </Button>
    </form>
  );
}

/** @deprecated Use AssignTaskForm */
export const ClaimTaskForm = AssignTaskForm;
