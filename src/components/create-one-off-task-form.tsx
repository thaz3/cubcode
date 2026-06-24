"use client";

import { TaskTemplateForm } from "@/components/task-template-form";
import {
  createAndAssignCustomTaskAction,
  createCustomTaskAction,
} from "@/lib/actions/tasks";

type CreateOneOffTaskFormProps = {
  cubId?: string;
  cubName?: string;
  compact?: boolean;
};

export function CreateOneOffTaskForm({
  cubId,
  cubName,
  compact = false,
}: CreateOneOffTaskFormProps) {
  const assignToCub = Boolean(cubId);

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      {!compact ? (
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {assignToCub
              ? `Create a one-off task for ${cubName}`
              : "Create a one-off task"}
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            {assignToCub
              ? "Skip templates — define the task here and assign it directly."
              : "Skip templates — add a custom task straight to the family board."}
          </p>
        </div>
      ) : null}
      <TaskTemplateForm
        action={
          assignToCub ? createAndAssignCustomTaskAction : createCustomTaskAction
        }
        submitLabel={
          assignToCub ? "Create and assign task" : "Add to task board"
        }
        showDueDate={assignToCub}
        showQuickDue={assignToCub}
        hiddenFields={assignToCub && cubId ? { cubId } : undefined}
      />
    </div>
  );
}
