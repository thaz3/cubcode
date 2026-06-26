"use client";

import { TaskUrgentField } from "@/components/task-urgent-field";
import { TaskDueDateField, useDueDateFormAction } from "@/components/task-due-date-field";
import { TaskRecurrenceField } from "@/components/task-recurrence-field";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ActionState } from "@/lib/actions/auth";
import { assignTaskAction } from "@/lib/actions/tasks";
import { formatProofType } from "@/lib/task-labels";
import { formatTaskCategory } from "@/lib/task-categories";
import type { GrowthCategory, TaskCategory, TaskProofType } from "@/generated/prisma/client";

export type LibraryTaskOption = {
  id: string;
  title: string;
  description: string | null;
  category: TaskCategory;
  subcategory: string | null;
  growthCategory: GrowthCategory | null;
  proofType: TaskProofType;
};

type CubLibraryAssignCardProps = {
  task: LibraryTaskOption;
  cubId: string;
};

export function CubLibraryAssignCard({ task, cubId }: CubLibraryAssignCardProps) {
  const { state, formAction, isPending, onDueDateChange } = useDueDateFormAction(
    assignTaskAction,
    {} as ActionState,
  );

  return (
    <Card className="p-4">
      <div>
        <h3 className="font-medium text-zinc-100">{task.title}</h3>
        {task.description ? (
          <p className="mt-1 text-sm text-zinc-500">{task.description}</p>
        ) : null}
        <p className="mt-1 text-xs text-zinc-500">
          {formatTaskCategory(task.category, {
            subcategory: task.subcategory,
            growthCategory: task.growthCategory,
          })}{" "}
          · {formatProofType(task.proofType)}
        </p>
      </div>

      <form action={formAction} className="mt-4 space-y-3">
        <input type="hidden" name="taskId" value={task.id} />
        <input type="hidden" name="cubId" value={cubId} />

        <CollapsibleSection title="Schedule" summary="Due date and repeat">
          <div className="space-y-4">
            <TaskDueDateField
              id={`library-card-due-${task.id}`}
              showQuickDue
              onDueDateChange={onDueDateChange}
            />
            <TaskRecurrenceField />
            <TaskUrgentField id={`library-urgent-${task.id}`} />
          </div>
        </CollapsibleSection>

        {state.error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
        ) : null}
        {state.success ? (
          <p className="text-sm text-green-700 dark:text-green-400">
            {state.success}
          </p>
        ) : null}

        <Button type="submit" disabled={isPending} fullWidth>
          {isPending ? "Assigning..." : "Assign from library"}
        </Button>
      </form>
    </Card>
  );
}
