import { ActiveTaskList } from "@/components/active-task-list";
import { TaskPoolCard } from "@/components/task-pool-card";
import { SwipeCardDeck } from "@/components/ui/swipe-card-deck";
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
};

export function TaskBoardWorkflow({
  tasks,
  pendingReviewCount,
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
          description="Tasks you assigned — waiting for your Cub to start."
        />
        {assigned.length === 0 ? (
          <EmptyState
            title="Nothing assigned yet"
            description="Assign from your task library or create a task for a Cub."
            actionLabel="Open task library"
            actionHref="/dashboard/tasks/library"
          />
        ) : (
          <ActiveTaskList items={groupActiveTasks(assigned)} />
        )}
      </section>

      <section id="active" className="scroll-mt-36 space-y-4">
        <SectionHeader
          title="Active"
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

export function TaskLibraryWorkflow({
  tasks,
  cubs,
}: {
  tasks: TaskWithCub[];
  cubs: Array<{ id: string; displayName: string }>;
}) {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Ready to assign"
        description="Unassigned tasks in your household library. Assign one when you're ready."
      />
      {tasks.length === 0 ? (
        <EmptyState
          title="No tasks in the library"
          description="Create a new task below or start from a template."
          actionLabel="Browse templates"
          actionHref="/dashboard/tasks/templates"
        />
      ) : (
        <SwipeCardDeck>
          {tasks.map((task) => (
            <TaskPoolCard key={task.id} task={task} cubs={cubs} />
          ))}
        </SwipeCardDeck>
      )}
    </div>
  );
}
