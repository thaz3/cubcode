"use client";

import { useActionState } from "react";
import { TaskRewardFields } from "@/components/task-reward-fields";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { FormSubmitFooter } from "@/components/ui/form-submit-footer";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/actions/auth";
import { updateTaskRewardsAction } from "@/lib/actions/tasks";
import { formatTaskRewards } from "@/lib/task-labels";
import type { TaskRewardValues } from "@/lib/cub-task-fields";

type TaskRewardsEditFormProps = {
  taskId: string;
  initialValues: TaskRewardValues;
  compact?: boolean;
};

export function TaskRewardsEditForm({
  taskId,
  initialValues,
  compact = false,
}: TaskRewardsEditFormProps) {
  const boundAction = updateTaskRewardsAction.bind(null, taskId);
  const [state, formAction, isPending] = useActionState(
    boundAction,
    {} as ActionState,
  );

  const summary = formatTaskRewards(initialValues);

  return (
    <CollapsibleSection
      title="Edit rewards"
      summary={summary}
      defaultOpen={false}
    >
      <form action={formAction} className={compact ? "space-y-3" : "space-y-4"}>
        <TaskRewardFields initialValues={initialValues} />
        <FormSubmitFooter error={state.error} success={state.success}>
          <Button type="submit" disabled={isPending} size={compact ? "sm" : "lg"}>
            {isPending ? "Saving..." : "Save rewards"}
          </Button>
        </FormSubmitFooter>
      </form>
    </CollapsibleSection>
  );
}
