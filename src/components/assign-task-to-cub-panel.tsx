"use client";

import Link from "next/link";
import { ParentAssignEarnPanel } from "@/components/parent-assign-earn-panel";
import {
  CubLibraryAssignCard,
  type LibraryTaskOption,
} from "@/components/cub-library-assign-card";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import type { Cub, GrowthCategory } from "@/generated/prisma/client";

type AssignTaskToCubPanelProps = {
  cubId: string;
  cubName: string;
  libraryTasks: LibraryTaskOption[];
  cubs: Cub[];
  bonusGrowthOptions?: Array<{ value: GrowthCategory; label: string }>;
};

export function AssignTaskToCubPanel({
  cubId,
  cubName,
  libraryTasks,
  cubs,
  bonusGrowthOptions = [],
}: AssignTaskToCubPanelProps) {
  const hasLibraryTasks = libraryTasks.length > 0;

  return (
    <div className="space-y-3">
      <CollapsibleSection
        title="What do you want to assign?"
        summary={`Choose an earn type for ${cubName}`}
        defaultOpen={!hasLibraryTasks}
      >
        <ParentAssignEarnPanel
          cubs={cubs}
          defaultCubId={cubId}
          compact
          bonusGrowthOptions={bonusGrowthOptions}
        />
      </CollapsibleSection>

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
                href="/dashboard/tasks#ready-to-assign"
                className="font-medium text-cub-gold hover:text-cub-gold-light"
              >
                Manage library on Assignments →
              </Link>
            </p>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">
            Save tasks to your household library on the{" "}
            <Link href="/dashboard/tasks#create" className="text-cub-gold">
              Assignments board
            </Link>
            , then assign them here.
          </p>
        )}
      </CollapsibleSection>
    </div>
  );
}
