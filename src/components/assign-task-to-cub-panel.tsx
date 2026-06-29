"use client";

import Link from "next/link";
import { ParentAssignEarnPanel } from "@/components/parent-assign-earn-panel";
import {
  CubLibraryAssignCard,
  type LibraryTaskOption,
} from "@/components/cub-library-assign-card";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import type { ParentAssignKind } from "@/components/parent-assign-earn-panel";
import type { Cub, GrowthCategory } from "@/generated/prisma/client";
import { parseParentAssignKind } from "@/lib/earn-types";

type AssignTaskToCubPanelProps = {
  cubId: string;
  cubName: string;
  libraryTasks: LibraryTaskOption[];
  cubs: Cub[];
  bonusGrowthOptions?: Array<{ value: GrowthCategory; label: string }>;
  defaultKind?: ParentAssignKind;
};

export function AssignTaskToCubPanel({
  cubId,
  cubName,
  libraryTasks,
  cubs,
  bonusGrowthOptions = [],
  defaultKind = "task",
}: AssignTaskToCubPanelProps) {
  const hasLibraryTasks = libraryTasks.length > 0;

  return (
    <div className="space-y-3">
      <ParentAssignEarnPanel
        cubs={cubs}
        defaultCubId={cubId}
        defaultKind={defaultKind}
        compact
        bonusGrowthOptions={bonusGrowthOptions}
      />

      <CollapsibleSection
        title="Task library"
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
            {libraryTasks.map((task) => (
              <CubLibraryAssignCard key={task.id} task={task} cubId={cubId} />
            ))}
            <p className="text-xs text-zinc-500">
              <Link
                href="/dashboard/tasks#library"
                className="font-medium text-cub-gold hover:text-cub-gold-light"
              >
                Manage library on Assignments →
              </Link>
            </p>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">
            Save tasks to your household library on the{" "}
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
