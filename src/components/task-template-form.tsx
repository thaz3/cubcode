"use client";

import { TaskDueDateField, useDueDateFormAction } from "@/components/task-due-date-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProofConfigFields } from "@/components/proof-config-fields";
import {
  TaskCategoryFields,
  type TaskCategoryValues,
} from "@/components/task-category-fields";
import type { ProofConfigValues } from "@/components/proof-config-fields";
import type { ActionState } from "@/lib/actions/auth";
import { createTaskTemplateAction } from "@/lib/actions/task-templates";
import type { CategorySuggestion } from "@/lib/task-categories";
import type { TaskProofType } from "@/generated/prisma/client";
import { useState } from "react";

type TaskTemplateFormProps = {
  action: (
    prevState: ActionState,
    formData: FormData,
  ) => Promise<ActionState>;
  initialValues?: {
    title: string;
    description: string;
  } & Partial<ProofConfigValues> &
    Partial<TaskCategoryValues>;
  submitLabel: string;
  showDueDate?: boolean;
  showQuickDue?: boolean;
  initialDueDate?: string;
  hiddenFields?: Record<string, string>;
};

export function TaskTemplateForm({
  action,
  initialValues,
  submitLabel,
  showDueDate = false,
  showQuickDue = false,
  initialDueDate = "",
  hiddenFields,
}: TaskTemplateFormProps) {
  const { state, formAction, isPending, onDueDateChange } = useDueDateFormAction(
    action,
    {},
    { enabled: showDueDate, initialDueDate },
  );
  const [proofKey, setProofKey] = useState(0);
  const [proofDefaults, setProofDefaults] = useState<
    Partial<ProofConfigValues>
  >({
    proofType: initialValues?.proofType,
    proofPrompt: initialValues?.proofPrompt,
    proofChecklistItems: initialValues?.proofChecklistItems,
  });

  function handleApplySuggested(suggestion: CategorySuggestion) {
    setProofDefaults({
      proofType: suggestion.proofType as TaskProofType,
      proofPrompt: suggestion.proofPrompt,
      proofChecklistItems: suggestion.proofChecklistItems,
    });
    setProofKey((key) => key + 1);
  }

  return (
    <form action={formAction} className="space-y-6">
      {hiddenFields
        ? Object.entries(hiddenFields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))
        : null}

      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={initialValues?.title ?? ""}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description (optional)</Label>
        <textarea
          id="description"
          name="description"
          defaultValue={initialValues?.description ?? ""}
          rows={3}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>

      <TaskCategoryFields
        initialValues={{
          category: initialValues?.category,
          subcategory: initialValues?.subcategory,
          growthCategory: initialValues?.growthCategory,
        }}
        onApplySuggested={handleApplySuggested}
      />

      <ProofConfigFields
        key={proofKey}
        initialValues={{
          proofType: proofDefaults.proofType ?? initialValues?.proofType,
          proofPrompt: proofDefaults.proofPrompt ?? initialValues?.proofPrompt,
          proofChecklistItems:
            proofDefaults.proofChecklistItems ??
            initialValues?.proofChecklistItems,
        }}
      />

      <p className="text-sm text-zinc-500">
        Category sets suggested rewards when the task is added to the board.
        Earned amounts come from each Cub&apos;s profile when assigned. Parent
        approval is always required.
      </p>

      {showDueDate ? (
        <TaskDueDateField
          id="task-due-date"
          defaultValue={initialDueDate}
          showQuickDue={showQuickDue}
          onDueDateChange={onDueDateChange}
        />
      ) : null}

      {state.error ? (
        <p className="text-sm text-red-600">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-green-700">{state.success}</p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}

export function CreateTaskTemplateForm({
  initialValues,
}: {
  initialValues?: TaskTemplateFormProps["initialValues"];
}) {
  return (
    <TaskTemplateForm
      action={createTaskTemplateAction}
      submitLabel="Create template"
      initialValues={initialValues}
    />
  );
}
