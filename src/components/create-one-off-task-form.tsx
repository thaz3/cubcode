"use client";

import { TaskTemplateForm } from "@/components/task-template-form";
import { createAndAssignCustomTaskAction } from "@/lib/actions/tasks";

type CreateOneOffTaskFormProps = {
  cubs: Array<{ id: string; displayName: string }>;
  defaultCubId?: string;
  compact?: boolean;
};

export function CreateOneOffTaskForm({
  cubs,
  defaultCubId,
  compact = false,
}: CreateOneOffTaskFormProps) {
  const defaultCubIds = defaultCubId ? [defaultCubId] : [];
  const cubName = defaultCubId
    ? cubs.find((c) => c.id === defaultCubId)?.displayName
    : undefined;

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      {!compact ? (
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {defaultCubId
              ? `Create new task for ${cubName}`
              : "Create new task"}
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Define the task, pick who it&apos;s for, and assign it to their board.
          </p>
        </div>
      ) : null}
      <TaskTemplateForm
        action={createAndAssignCustomTaskAction}
        submitLabel="Create and assign task"
        showDueDate
        showQuickDue
        showUrgent
        cubs={cubs}
        defaultCubIds={defaultCubIds}
        compact={compact}
      />
    </div>
  );
}
