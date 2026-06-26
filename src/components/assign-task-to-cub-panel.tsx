"use client";

import Link from "next/link";
import { ParentCreateWorkPanel } from "@/components/parent-create-work-panel";
import {
  CubLibraryAssignCard,
  type LibraryTaskOption,
} from "@/components/cub-library-assign-card";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import type { Cub } from "@/generated/prisma/client";

type AssignTaskToCubPanelProps = {
  cubId: string;
  cubName: string;
  libraryTasks: LibraryTaskOption[];
  cubs: Cub[];
};

export function AssignTaskToCubPanel({
  cubId,
  cubName,
  libraryTasks,
  cubs,
}: AssignTaskToCubPanelProps) {
  const hasLibraryTasks = libraryTasks.length > 0;

  return (
    <div className="space-y-3">
      <CollapsibleSection
        title="Create task or routine"
        summary={`One-time work or repeating habit for ${cubName}`}
        defaultOpen={!hasLibraryTasks}
      >
        <ParentCreateWorkPanel cubs={cubs} defaultCubId={cubId} compact />
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
              Pick a saved task, set a schedule if needed, and assign it to{" "}
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
            Save tasks to your household library from{" "}
            <Link href="/dashboard/create" className="text-cub-gold">
              Create
            </Link>{" "}
            or the{" "}
            <Link href="/dashboard/tasks#ready-to-assign" className="text-cub-gold">
              Assignments board
            </Link>
            , then assign them here.
          </p>
        )}
      </CollapsibleSection>
    </div>
  );
}
