"use client";

import Link from "next/link";
import { CreateOneOffTaskForm } from "@/components/create-one-off-task-form";
import { CubTemplateAssignCard } from "@/components/cub-template-assign-card";
import { TaskUrgentField } from "@/components/task-urgent-field";
import { TaskDueDateField, useDueDateFormAction } from "@/components/task-due-date-field";
import { TaskRecurrenceField } from "@/components/task-recurrence-field";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/actions/auth";
import { assignTaskAction } from "@/lib/actions/tasks";
import type { TaskTemplate } from "@/generated/prisma/client";
import { useState } from "react";

type TaskOption = { id: string; title: string };

type AssignTaskToCubPanelProps = {
  cubId: string;
  cubName: string;
  availableTasks: TaskOption[];
  templates: TaskTemplate[];
};

export function AssignTaskToCubPanel({
  cubId,
  cubName,
  availableTasks,
  templates,
}: AssignTaskToCubPanelProps) {
  const {
    state: poolState,
    formAction: poolAction,
    isPending: poolPending,
    onDueDateChange: onPoolDueDateChange,
  } = useDueDateFormAction(assignTaskAction, {} as ActionState);

  const [poolTaskId, setPoolTaskId] = useState(availableTasks[0]?.id ?? "");

  const hasPoolTasks = availableTasks.length > 0;
  const hasTemplates = templates.length > 0;

  return (
    <div className="space-y-3">
      <CollapsibleSection
        title="Create new task"
        summary={`Define and assign directly to ${cubName}`}
        defaultOpen
      >
        <CreateOneOffTaskForm cubId={cubId} cubName={cubName} compact />
      </CollapsibleSection>

      {hasPoolTasks ? (
        <CollapsibleSection
          title="From task library"
          summary={`${availableTasks.length} unassigned task${availableTasks.length === 1 ? "" : "s"}`}
        >
          <form action={poolAction} className="space-y-3">
            <input type="hidden" name="cubId" value={cubId} />
            <input type="hidden" name="taskId" value={poolTaskId} />
            <div className="space-y-1.5">
              <label
                htmlFor={`pool-task-select-${cubId}`}
                className="text-xs font-medium uppercase tracking-wide text-zinc-500"
              >
                Task
              </label>
              <select
                id={`pool-task-select-${cubId}`}
                value={poolTaskId}
                onChange={(event) => setPoolTaskId(event.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
              >
                {availableTasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </div>
            <CollapsibleSection title="Schedule" summary="Due date and repeat">
              <div className="space-y-4">
                <TaskDueDateField
                  id={`pool-due-${cubId}`}
                  showQuickDue
                  onDueDateChange={onPoolDueDateChange}
                />
                <TaskRecurrenceField />
                <TaskUrgentField id={`pool-urgent-${cubId}`} />
              </div>
            </CollapsibleSection>
            {poolState.error ? (
              <p className="text-sm text-red-600 dark:text-red-400">
                {poolState.error}
              </p>
            ) : null}
            {poolState.success ? (
              <p className="text-sm text-green-700 dark:text-green-400">
                {poolState.success}
              </p>
            ) : null}
            <Button type="submit" disabled={poolPending || !poolTaskId} fullWidth>
              {poolPending ? "Assigning..." : "Assign from library"}
            </Button>
          </form>
        </CollapsibleSection>
      ) : null}

      {hasTemplates ? (
        <div className="space-y-3 pt-1">
          <div>
            <p className="text-sm font-medium text-zinc-100">From template</p>
            <p className="mt-0.5 text-xs text-zinc-500">
              Pick a template card to assign to {cubName}.
            </p>
          </div>
          <div className="space-y-3">
            {templates.map((template) => (
              <CubTemplateAssignCard
                key={template.id}
                template={template}
                cubId={cubId}
              />
            ))}
          </div>
        </div>
      ) : !hasPoolTasks ? (
        <p className="text-sm text-zinc-500">
          Or{" "}
          <Link href="/dashboard/tasks/templates/new" className="text-amber-700">
            save a reusable template
          </Link>{" "}
          for tasks you assign often.
        </p>
      ) : null}
    </div>
  );
}
