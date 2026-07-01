"use client";

import { TaskTemplateForm } from "@/components/task-template-form";
import { TaskRewardFields } from "@/components/task-reward-fields";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { createAndAssignCustomTaskAction } from "@/lib/actions/tasks";
import type { TaskRewardValues } from "@/lib/cub-task-fields";

type CreateOneOffTaskFormProps = {
  cubs: Array<{ id: string; displayName: string }>;
  defaultCubId?: string;
  defaultRewards?: TaskRewardValues;
  compact?: boolean;
};

export function CreateOneOffTaskForm({
  cubs,
  defaultCubId,
  defaultRewards,
  compact = false,
}: CreateOneOffTaskFormProps) {
  const defaultCubIds = defaultCubId ? [defaultCubId] : [];
  const cubName = defaultCubId
    ? cubs.find((c) => c.id === defaultCubId)?.displayName
    : undefined;

  const rewardFields = (
    <CollapsibleSection
      title="Rewards on approval"
      summary={
        defaultRewards
          ? `${defaultRewards.focusMinutesEarned} focus min · ${defaultRewards.phoneMinutesEarned} phone min · ${defaultRewards.xpEarned} XP · ${defaultRewards.focusTokensEarned} token${defaultRewards.focusTokensEarned === 1 ? "" : "s"}`
          : "Set what your Cub earns when you approve"
      }
    >
      <TaskRewardFields initialValues={defaultRewards} />
    </CollapsibleSection>
  );

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
        rewardFields={rewardFields}
      />
    </div>
  );
}
