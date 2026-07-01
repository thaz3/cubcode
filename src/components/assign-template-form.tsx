"use client";

import { TaskDueDateField, useDueDateFormAction } from "@/components/task-due-date-field";
import { TaskRecurrenceField } from "@/components/task-recurrence-field";
import { ActionSuccessDialog } from "@/components/ui/action-success-dialog";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { Button } from "@/components/ui/button";
import { RadioChoiceList } from "@/components/ui/radio-choice-list";
import type { ActionState } from "@/lib/actions/auth";
import { assignTemplateToCubAction } from "@/lib/actions/task-templates";
import { useState } from "react";

type AssignTemplateFormProps = {
  templateId: string;
  cubs: Array<{ id: string; displayName: string }>;
  submitLabel?: string;
};

export function AssignTemplateForm({
  templateId,
  cubs,
  submitLabel = "Assign to Cub",
}: AssignTemplateFormProps) {
  const { state, formAction, isPending, onDueDateChange } = useDueDateFormAction(
    assignTemplateToCubAction,
    {} as ActionState,
  );
  const [cubId, setCubId] = useState(cubs[0]?.id ?? "");

  if (cubs.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        Add a Cub profile before assigning tasks.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <ActionSuccessDialog
        message={state.success}
        title="Task assigned"
      />
      <input type="hidden" name="templateId" value={templateId} />
      <input type="hidden" name="cubId" value={cubId} />
      <RadioChoiceList
        name={`assign-template-cub-${templateId}`}
        value={cubId}
        onChange={setCubId}
        layout="compact"
        options={cubs.map((cub) => ({
          value: cub.id,
          label: cub.displayName,
        }))}
      />
      <CollapsibleSection title="Schedule" summary="Due date and repeat">
        <div className="space-y-4">
          <TaskDueDateField
            id={`assign-template-due-${templateId}`}
            onDueDateChange={onDueDateChange}
            showQuickDue
          />
          <TaskRecurrenceField />
        </div>
      </CollapsibleSection>
      {state.error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      ) : null}
      <Button type="submit" disabled={isPending || !cubId} size="lg" fullWidth>
        {isPending ? "Assigning..." : submitLabel}
      </Button>
    </form>
  );
}
