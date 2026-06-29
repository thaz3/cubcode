"use client";

import type { ReactNode } from "react";
import { ActiveTaskList } from "@/components/active-task-list";
import { AssignmentBoardReviewList } from "@/components/assignment-board-review-list";
import { CompactLibraryTaskCard } from "@/components/compact-library-task-card";
import {
  CollapsibleSection,
  useOpenOnHash,
} from "@/components/ui/collapsible-section";
import { EmptyState } from "@/components/ui/empty-state";
import { WaitingForReviewNotice } from "@/components/waiting-for-review-notice";
import { groupActiveTasks } from "@/lib/task-groups";
import { partitionTasksByBoardSection } from "@/lib/task-board-sections";
import type { ReviewQueueItem } from "@/lib/review-queue";
import type { TaskWithCub } from "@/lib/task-groups";

type TaskBoardWorkflowProps = {
  tasks: TaskWithCub[];
  pendingReviewCount: number;
  reviewQueueItems: ReviewQueueItem[];
  libraryTasks?: TaskWithCub[];
  routinesCount?: number;
  routinesSection?: ReactNode;
};

function TaskBoardDropdownSection({
  sectionId,
  title,
  summary,
  count,
  defaultOpen = false,
  children,
}: {
  sectionId: string;
  title: string;
  summary: string;
  count: number;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useOpenOnHash(sectionId, defaultOpen);

  return (
    <section id={sectionId} className="scroll-mt-36">
      <CollapsibleSection
        title={title}
        summary={summary}
        badge={count}
        defaultOpen={defaultOpen}
        open={open}
        onOpenChange={setOpen}
      >
        {children}
      </CollapsibleSection>
    </section>
  );
}

export function TaskBoardWorkflow({
  tasks,
  pendingReviewCount,
  reviewQueueItems,
  libraryTasks = [],
  routinesCount = 0,
  routinesSection,
}: TaskBoardWorkflowProps) {
  const { assigned, active, completed } = partitionTasksByBoardSection(tasks);

  const hasAnyWork =
    libraryTasks.length > 0 ||
    assigned.length > 0 ||
    active.length > 0 ||
    reviewQueueItems.length > 0 ||
    completed.length > 0 ||
    routinesCount > 0;

  return (
    <div className="space-y-3">
      {pendingReviewCount > 0 ? (
        <WaitingForReviewNotice
          count={pendingReviewCount}
          reviewHref="/dashboard/tasks#in-review"
        />
      ) : null}

      {!hasAnyWork ? (
        <EmptyState
          title="No assignments yet"
          description="Create a one-time task or repeating routine, then assign it to a Cub."
          actionLabel="Assign work"
          actionHref="/dashboard/tasks/assign"
        />
      ) : null}

      <TaskBoardDropdownSection
        sectionId="library"
        title="Library"
        summary="One-time tasks saved — assign to a Cub when ready"
        count={libraryTasks.length}
      >
        {libraryTasks.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Nothing in the library. Create a task below, or save one without
            assigning it yet.
          </p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {libraryTasks.map((task) => (
              <li key={task.id}>
                <CompactLibraryTaskCard task={task} />
              </li>
            ))}
          </ul>
        )}
      </TaskBoardDropdownSection>

      <TaskBoardDropdownSection
        sectionId="waiting-to-start"
        title="Waiting to start"
        summary="Assigned to a Cub — not begun yet"
        count={assigned.length}
        defaultOpen={assigned.length > 0}
      >
        {assigned.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No tasks waiting to start. Assign from the library or create a new
            task below.
          </p>
        ) : (
          <ActiveTaskList items={groupActiveTasks(assigned)} layout="list" />
        )}
      </TaskBoardDropdownSection>

      {routinesSection}

      <TaskBoardDropdownSection
        sectionId="active"
        title="In progress"
        summary="Cubs are working on these now"
        count={active.length}
        defaultOpen={active.length > 0}
      >
        {active.length === 0 ? (
          <p className="text-sm text-zinc-500">No tasks in progress right now.</p>
        ) : (
          <ActiveTaskList items={groupActiveTasks(active)} layout="list" />
        )}
      </TaskBoardDropdownSection>

      <TaskBoardDropdownSection
        sectionId="in-review"
        title="In review"
        summary="Submitted — waiting for your approval"
        count={reviewQueueItems.length}
        defaultOpen={reviewQueueItems.length > 0}
      >
        {reviewQueueItems.length === 0 ? (
          <p className="text-sm text-zinc-500">Nothing in review.</p>
        ) : (
          <AssignmentBoardReviewList items={reviewQueueItems} />
        )}
      </TaskBoardDropdownSection>

      <TaskBoardDropdownSection
        sectionId="completed"
        title="Completed"
        summary="Approved and credited, or rejected"
        count={completed.length}
      >
        {completed.length === 0 ? (
          <p className="text-sm text-zinc-500">No completed tasks yet.</p>
        ) : (
          <ActiveTaskList items={groupActiveTasks(completed)} layout="list" />
        )}
      </TaskBoardDropdownSection>
    </div>
  );
}
