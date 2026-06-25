"use client";

import { TaskUrgentField } from "@/components/task-urgent-field";
import { TaskDueDateField, useDueDateFormAction } from "@/components/task-due-date-field";
import { TaskRecurrenceField } from "@/components/task-recurrence-field";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ActionState } from "@/lib/actions/auth";
import { assignTemplateToCubAction } from "@/lib/actions/task-templates";
import { formatProofType } from "@/lib/task-labels";
import { formatTaskCategory } from "@/lib/task-categories";
import { formatTaskRecurrence } from "@/lib/task-recurrence";
import type { TaskTemplate } from "@/generated/prisma/client";

type CubTemplateAssignCardProps = {
  template: TaskTemplate;
  cubId: string;
};

export function CubTemplateAssignCard({
  template,
  cubId,
}: CubTemplateAssignCardProps) {
  const { state, formAction, isPending, onDueDateChange } = useDueDateFormAction(
    assignTemplateToCubAction,
    {} as ActionState,
  );

  const recurrenceLabel = formatTaskRecurrence(template.recurrence);

  return (
    <Card className="p-4">
      <div>
        <h3 className="font-medium text-zinc-100">{template.title}</h3>
        {template.description ? (
          <p className="mt-1 text-sm text-zinc-500">{template.description}</p>
        ) : null}
        <p className="mt-1 text-xs text-zinc-500">
          {formatTaskCategory(template.category, {
            subcategory: template.subcategory,
            growthCategory: template.growthCategory,
          })}{" "}
          · {formatProofType(template.proofType)}
          {recurrenceLabel ? ` · ${recurrenceLabel}` : ""}
        </p>
      </div>

      <form action={formAction} className="mt-4 space-y-3">
        <input type="hidden" name="templateId" value={template.id} />
        <input type="hidden" name="cubId" value={cubId} />

        <CollapsibleSection title="Schedule" summary="Due date and repeat">
          <div className="space-y-4">
            <TaskDueDateField
              id={`template-card-due-${template.id}`}
              showQuickDue
              onDueDateChange={onDueDateChange}
            />
            <TaskRecurrenceField initialValue={template.recurrence} />
            <TaskUrgentField id={`template-urgent-${template.id}`} />
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
          {isPending ? "Assigning..." : "Assign from template"}
        </Button>
      </form>
    </Card>
  );
}
