"use client";

import { TaskUrgentField } from "@/components/task-urgent-field";
import { TaskDueDateField, useDueDateFormAction } from "@/components/task-due-date-field";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioChoiceList } from "@/components/ui/radio-choice-list";
import { FormSubmitFooter } from "@/components/ui/form-submit-footer";
import type { ActionState } from "@/lib/actions/auth";
import { assignTaskAction } from "@/lib/actions/tasks";
import { NATIVE_SELECT_CLASS } from "@/lib/mobile-form-styles";
import { useTouchNativeControls } from "@/components/use-prefers-hover";
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
  const [cubId, setCubId] = useState(cubs[0]?.id ?? "");
  const useNativeControls = useTouchNativeControls();

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
      <input type="hidden" name="cubId" value={cubId} />

      <div>
        <p className="mb-2 text-sm font-medium">Assign to child</p>
        <p className="mb-2 text-sm text-zinc-500">
          Choose which Cub this task is for. Their reward settings apply once
          you assign it. Cubs do not pick tasks from the board — parents assign
          them.
        </p>

        {useNativeControls ? (
          <div className="space-y-1.5">
            <Label htmlFor={`assign-cub-select-${taskId}`} className="sr-only">
              Assign to child
            </Label>
            <select
              id={`assign-cub-select-${taskId}`}
              value={cubId}
              onChange={(event) => setCubId(event.target.value)}
              className={NATIVE_SELECT_CLASS}
            >
              {cubs.map((cub) => (
                <option key={cub.id} value={cub.id}>
                  {cub.displayName}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <RadioChoiceList
            name={`assign-cub-${taskId}`}
            value={cubId}
            onChange={setCubId}
            options={cubs.map((cub) => ({
              value: cub.id,
              label: cub.displayName,
            }))}
          />
        )}
      </div>

      <TaskDueDateField
        id={`assign-due-${taskId}`}
        onDueDateChange={onDueDateChange}
        showQuickDue
      />

      <TaskUrgentField id={`assign-urgent-${taskId}`} />

      <FormSubmitFooter
        error={state.error}
        success={state.success}
        successAsDialog
        successDialogTitle="Task assigned"
      >
        <Button type="submit" disabled={isPending || !cubId} fullWidth size="lg">
          {isPending ? "Assigning..." : submitLabel}
        </Button>
      </FormSubmitFooter>
    </form>
  );
}

/** @deprecated Use AssignTaskForm */
export const ClaimTaskForm = AssignTaskForm;
