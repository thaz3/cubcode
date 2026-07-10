"use client";

import Link from "next/link";
import { ParentAssignEarnPanel } from "@/components/parent-assign-earn-panel";
import {
  CubLibraryAssignCard,
  type LibraryTaskOption,
} from "@/components/cub-library-assign-card";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import type { ParentAssignKind } from "@/components/parent-assign-earn-panel";
import type { Cub } from "@/generated/prisma/client";
import { PARENT_INLINE_ASSIGN_EARN_TYPES } from "@/lib/earn-types";
import { TASK_STASH_LABEL } from "@/lib/task-board-sections";
import { cubRewardFields } from "@/lib/cub-task-fields";

type AssignTaskToCubPanelProps = {
  cubId: string;
  cubName: string;
  libraryTasks: LibraryTaskOption[];
  cubs: Cub[];
  defaultKind?: ParentAssignKind;
  earnTypes?: readonly ParentAssignKind[];
};

export function AssignTaskToCubPanel({
  cubId,
  cubName,
  libraryTasks,
  cubs,
  defaultKind = "task",
  earnTypes = PARENT_INLINE_ASSIGN_EARN_TYPES,
}: AssignTaskToCubPanelProps) {
  const hasLibraryTasks = libraryTasks.length > 0;
  const cub = cubs.find((item) => item.id === cubId);
  const defaultRewards = cub ? cubRewardFields(cub) : undefined;

  return (
    <div className="space-y-3">
      <ParentAssignEarnPanel
        cubs={cubs}
        defaultCubId={cubId}
        defaultKind={defaultKind}
        compact
        earnTypes={earnTypes}
      />

      <CollapsibleSection
        title={TASK_STASH_LABEL}
        summary={
          hasLibraryTasks
            ? `${libraryTasks.length} saved task${libraryTasks.length === 1 ? "" : "s"} ready to assign`
            : "No saved tasks yet"
        }
        defaultOpen={hasLibraryTasks}
      >
        {hasLibraryTasks ? (
          <div className="space-y-3">
            <p className="text-xs text-zinc-500">
              Pick a saved one-time task, set a schedule if needed, and assign it to{" "}
              {cubName}.
            </p>
            {defaultRewards
              ? libraryTasks.map((task) => (
                  <CubLibraryAssignCard
                    key={task.id}
                    task={task}
                    cubId={cubId}
                    defaultRewards={defaultRewards}
                  />
                ))
              : null}
            <p className="text-xs text-zinc-500">
              <Link
                href="/dashboard/tasks#library"
                className="font-medium text-cub-gold hover:text-cub-gold-light"
              >
                Manage task stash on Assignments →
              </Link>
            </p>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">
            Save tasks to your household task stash on the{" "}
            <Link href="/dashboard/tasks/assign" className="text-cub-gold">
              Assignments board
            </Link>
            , then assign them here.
          </p>
        )}
      </CollapsibleSection>
    </div>
  );
}
