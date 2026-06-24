import { ActiveTaskList } from "@/components/active-task-list";
import { CreateOneOffTaskForm } from "@/components/create-one-off-task-form";
import { TaskPoolCard } from "@/components/task-pool-card";
import { Card } from "@/components/ui/card";
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
  cubs: Array<{ id: string; displayName: string }>;
  pendingReviewCount: number;
};

export function TaskBoardWorkflow({
  tasks,
  cubs,
  pendingReviewCount,
}: TaskBoardWorkflowProps) {
  const { created, active, inReview, completed } =
    partitionTasksByBoardSection(tasks);

  return (
    <div className="space-y-10">
      {pendingReviewCount > 0 ? (
        <WaitingForReviewNotice
          count={pendingReviewCount}
          reviewHref="/dashboard/tasks/review"
        />
      ) : null}

      <section id="assignment" className="scroll-mt-36 space-y-4">
        <SectionHeader
          title="Created"
          description="Unassigned tasks ready to assign to a Cub."
        />
        <Card>
          <h3 className="text-sm font-semibold text-zinc-100">
            Create one-off task
          </h3>
          <p className="mt-1 text-sm text-zinc-400">
            Add a custom task directly to the board.
          </p>
          <div className="mt-4">
            <CreateOneOffTaskForm compact />
          </div>
        </Card>
        {created.length === 0 ? (
          <EmptyState
            title="No tasks on the board"
            description="Create one above or add from your template library."
            actionLabel="Browse templates"
            actionHref="/dashboard/tasks/templates"
          />
        ) : (
          <div className="grid gap-4">
            {created.map((task) => (
              <TaskPoolCard key={task.id} task={task} cubs={cubs} />
            ))}
          </div>
        )}
      </section>

      <section id="active" className="scroll-mt-36 space-y-4">
        <SectionHeader
          title="Active"
          description="Assigned work in progress — not submitted yet."
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
