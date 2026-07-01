"use client";

import { TaskUrgentField } from "@/components/task-urgent-field";
import { TaskDueDateField, useDueDateFormAction } from "@/components/task-due-date-field";
import { TaskRecurrenceField } from "@/components/task-recurrence-field";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { FormSubmitFooter } from "@/components/ui/form-submit-footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ActionState } from "@/lib/actions/auth";
import { assignTaskAction } from "@/lib/actions/tasks";
import { formatProofType } from "@/lib/task-labels";
import { formatTaskCategory } from "@/lib/task-categories";
import { TaskRewardFields } from "@/components/task-reward-fields";
import type { TaskRewardValues } from "@/lib/cub-task-fields";
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
  defaultRewards: TaskRewardValues;
};

export function CubLibraryAssignCard({
  task,
  cubId,
  defaultRewards,
}: CubLibraryAssignCardProps) {
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

        <CollapsibleSection
          title="Rewards on approval"
          summary={`${defaultRewards.focusMinutesEarned} focus min · ${defaultRewards.phoneMinutesEarned} phone min · ${defaultRewards.xpEarned} XP`}
        >
          <TaskRewardFields initialValues={defaultRewards} />
        </CollapsibleSection>

        <FormSubmitFooter
          error={state.error}
          success={state.success}
          successAsDialog
          successDialogTitle="Task assigned"
        >
          <Button type="submit" disabled={isPending} fullWidth size="lg">
            {isPending ? "Assigning..." : "Assign from library"}
          </Button>
        </FormSubmitFooter>
      </form>
    </Card>
  );
}
