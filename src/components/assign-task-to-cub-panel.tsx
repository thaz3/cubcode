"use client";

import Link from "next/link";
import { CreateOneOffTaskForm } from "@/components/create-one-off-task-form";
import { TaskDueDateField, useDueDateFormAction } from "@/components/task-due-date-field";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { ActionState } from "@/lib/actions/auth";
import { assignTemplateToCubAction } from "@/lib/actions/task-templates";
import { assignTaskAction } from "@/lib/actions/tasks";

type TaskOption = { id: string; title: string };
type TemplateOption = { id: string; title: string };

type AssignTaskToCubPanelProps = {
  cubId: string;
  cubName: string;
  availableTasks: TaskOption[];
  templates: TemplateOption[];
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

  const {
    state: templateState,
    formAction: templateAction,
    isPending: templatePending,
    onDueDateChange: onTemplateDueDateChange,
  } = useDueDateFormAction(assignTemplateToCubAction, {} as ActionState);

  const hasPoolTasks = availableTasks.length > 0;
  const hasTemplates = templates.length > 0;

  return (
    <div className="space-y-8">
      <CreateOneOffTaskForm cubId={cubId} cubName={cubName} />

      {hasPoolTasks || hasTemplates ? (
        <div className="border-t border-zinc-200 pt-8 dark:border-zinc-800" />
      ) : (
        <p className="text-sm text-zinc-500">
          Or{" "}
          <Link href="/dashboard/tasks/templates/new" className="text-amber-700">
            save a reusable template
          </Link>{" "}
          for tasks you assign often.
        </p>
      )}

      {hasPoolTasks ? (
        <form action={poolAction} className="space-y-3">
          <input type="hidden" name="cubId" value={cubId} />
          <div>
            <Label htmlFor={`pool-task-${cubId}`}>From task board</Label>
            <p className="mt-1 text-sm text-zinc-500">
              Pick an available task and assign it to {cubName}.
            </p>
            <select
              id={`pool-task-${cubId}`}
              name="taskId"
              required
              defaultValue=""
              className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="" disabled>
                Select a task…
              </option>
              {availableTasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
          </div>
          <TaskDueDateField
            id={`pool-due-${cubId}`}
            showQuickDue
            onDueDateChange={onPoolDueDateChange}
          />
          {poolState.error ? (
            <p className="text-sm text-red-600 dark:text-red-400">{poolState.error}</p>
          ) : null}
          {poolState.success ? (
            <p className="text-sm text-green-700 dark:text-green-400">
              {poolState.success}
            </p>
          ) : null}
          <Button type="submit" disabled={poolPending}>
            {poolPending ? "Assigning..." : "Assign task"}
          </Button>
        </form>
      ) : null}

      {hasPoolTasks && hasTemplates ? (
        <div className="border-t border-zinc-200 pt-6 dark:border-zinc-800" />
      ) : null}

      {hasTemplates ? (
        <form action={templateAction} className="space-y-3">
          <input type="hidden" name="cubId" value={cubId} />
          <div>
            <Label htmlFor={`template-${cubId}`}>From template</Label>
            <p className="mt-1 text-sm text-zinc-500">
              Create a new task from a template and assign it directly to{" "}
              {cubName}.
            </p>
            <select
              id={`template-${cubId}`}
              name="templateId"
              required
              defaultValue=""
              className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="" disabled>
                Select a template…
              </option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.title}
                </option>
              ))}
            </select>
          </div>
          <TaskDueDateField
            id={`template-due-${cubId}`}
            showQuickDue
            onDueDateChange={onTemplateDueDateChange}
          />
          {templateState.error ? (
            <p className="text-sm text-red-600 dark:text-red-400">
              {templateState.error}
            </p>
          ) : null}
          {templateState.success ? (
            <p className="text-sm text-green-700 dark:text-green-400">
              {templateState.success}
            </p>
          ) : null}
          <Button type="submit" variant="secondary" disabled={templatePending}>
            {templatePending ? "Assigning..." : "Assign from template"}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
