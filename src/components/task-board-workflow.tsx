import type { ReactNode } from "react";
import { ActiveTaskList } from "@/components/active-task-list";
import { CompactLibraryTaskCard } from "@/components/compact-library-task-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { WaitingForReviewNotice } from "@/components/waiting-for-review-notice";
import { groupActiveTasks } from "@/lib/task-groups";
import { partitionTasksByBoardSection } from "@/lib/task-board-sections";
import Link from "next/link";
import type { TaskWithCub } from "@/lib/task-groups";

type TaskBoardWorkflowProps = {
  tasks: TaskWithCub[];
  pendingReviewCount: number;
  libraryTasks?: TaskWithCub[];
  routinesSection?: ReactNode;
};

export function TaskBoardWorkflow({
  tasks,
  pendingReviewCount,
  libraryTasks = [],
  routinesSection,
}: TaskBoardWorkflowProps) {
  const { assigned, active, inReview, completed } =
    partitionTasksByBoardSection(tasks);

  return (
    <div className="space-y-10">
      {pendingReviewCount > 0 ? (
        <WaitingForReviewNotice
          count={pendingReviewCount}
          reviewHref="/dashboard/tasks/review"
        />
      ) : null}

      <section id="assigned" className="scroll-mt-36 space-y-4">
        <SectionHeader
          title="Assigned"
          description="In your library waiting for a Cub, or assigned and waiting to start."
        />
        {assigned.length === 0 && libraryTasks.length === 0 ? (
          <EmptyState
            title="Nothing assigned yet"
            description="Create a task or routine, then assign it from here."
            actionLabel="Create task or routine"
            actionHref="#create"
          />
        ) : (
          <div className="space-y-4">
            {assigned.length > 0 ? (
              <ActiveTaskList items={groupActiveTasks(assigned)} />
            ) : null}

            {libraryTasks.length > 0 ? (
              <div id="ready-to-assign" className="space-y-2 scroll-mt-36">
                {assigned.length > 0 ? (
                  <p className="text-sm font-medium text-zinc-400">In library</p>
                ) : null}
                <ul className="space-y-2">
                  {libraryTasks.map((task) => (
                    <li key={task.id}>
                      <CompactLibraryTaskCard task={task} />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </section>

      {routinesSection}

      <section id="active" className="scroll-mt-36 space-y-4">
        <SectionHeader
          title="Active Tasks"
          description="Work in progress — not submitted yet."
        />
        {active.length === 0 ? (
          <p className="text-sm text-zinc-500">No active tasks right now.</p>
        ) : (
          <ActiveTaskList items={groupActiveTasks(active)} />
        )}
      </section>

      <section id="in-review" className="scroll-mt-36 space-y-4">
        <SectionHeader
          title="In review"
          description="Submitted tasks waiting for parent approval."
        />
        {inReview.length === 0 ? (
          <p className="text-sm text-zinc-500">Nothing in review.</p>
        ) : (
          <>
            <ActiveTaskList items={groupActiveTasks(inReview)} />
            <Link href="/dashboard/tasks/review">
              <Button fullWidth size="lg">
                Open review inbox
              </Button>
            </Link>
          </>
        )}
      </section>

      <section id="completed" className="scroll-mt-36 space-y-4">
        <SectionHeader
          title="Completed"
          description="Approved and credited, or rejected."
        />
        {completed.length === 0 ? (
          <p className="text-sm text-zinc-500">No completed tasks yet.</p>
        ) : (
          <ActiveTaskList items={groupActiveTasks(completed)} />
        )}
      </section>
    </div>
  );
}
