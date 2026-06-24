"use client";

import Link from "next/link";
import { CreateOneOffTaskForm } from "@/components/create-one-off-task-form";
import { TaskDueDateField, useDueDateFormAction } from "@/components/task-due-date-field";
import { Button } from "@/components/ui/button";
import { RadioChoiceList } from "@/components/ui/radio-choice-list";
import type { ActionState } from "@/lib/actions/auth";
import { assignTemplateToCubAction } from "@/lib/actions/task-templates";
import { assignTaskAction } from "@/lib/actions/tasks";
import { useState } from "react";

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

  const [poolTaskId, setPoolTaskId] = useState(availableTasks[0]?.id ?? "");
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");

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
          <input type="hidden" name="taskId" value={poolTaskId} />
          <div>
            <p className="mb-2 text-sm font-medium">From task board</p>
            <p className="mb-2 text-sm text-zinc-500">
              Pick an available task and assign it to {cubName}.
            </p>
            <RadioChoiceList
              name={`pool-task-${cubId}`}
              value={poolTaskId}
              onChange={setPoolTaskId}
              options={availableTasks.map((task) => ({
                value: task.id,
                label: task.title,
              }))}
            />
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
          <Button type="submit" disabled={poolPending || !poolTaskId}>
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
          <input type="hidden" name="templateId" value={templateId} />
          <div>
            <p className="mb-2 text-sm font-medium">From template</p>
            <p className="mb-2 text-sm text-zinc-500">
              Create a new task from a template and assign it directly to{" "}
              {cubName}.
            </p>
            <RadioChoiceList
              name={`template-${cubId}`}
              value={templateId}
              onChange={setTemplateId}
              options={templates.map((template) => ({
                value: template.id,
                label: template.title,
              }))}
            />
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
          <Button
            type="submit"
            variant="secondary"
            disabled={templatePending || !templateId}
          >
            {templatePending ? "Assigning..." : "Assign from template"}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
