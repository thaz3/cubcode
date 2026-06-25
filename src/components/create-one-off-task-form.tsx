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
              ? `Create new task for ${cubName}`
              : "Create new task"}
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            {assignToCub
              ? "Define the task here and assign it directly."
              : "Add a new task to your library."}
          </p>
        </div>
      ) : null}
      <TaskTemplateForm
        action={
          assignToCub ? createAndAssignCustomTaskAction : createCustomTaskAction
        }
        submitLabel={
          assignToCub ? "Create and assign task" : "Create new task"
        }
        showDueDate={assignToCub}
        showQuickDue={assignToCub}
        hiddenFields={assignToCub && cubId ? { cubId } : undefined}
        compact={compact}
      />
    </div>
  );
}
