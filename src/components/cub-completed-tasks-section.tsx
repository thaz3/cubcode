import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatTaskRewards } from "@/lib/task-labels";
import type { TaskStatus } from "@/generated/prisma/client";

type CompletedTask = {
  id: string;
  title: string;
  status: TaskStatus;
  reviewedAt: Date | null;
  updatedAt: Date;
  xpEarned: number;
  focusTokensEarned: number;
  phoneMinutesEarned: number;
  focusMinutesEarned: number;
  dueAt: Date | null;
  submittedAt: Date | null;
};

type CubCompletedTasksSectionProps = {
  tasks: CompletedTask[];
};

export function CubCompletedTasksSection({ tasks }: CubCompletedTasksSectionProps) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100">Completed tasks</h2>
        <p className="text-sm text-zinc-500">
          {tasks.length === 0
            ? "Finished work shows up here after parent approval"
            : `${tasks.length} task${tasks.length === 1 ? "" : "s"} you've finished`}
        </p>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          title="No completed tasks yet"
          description="Submit your work and wait for parent approval — then it lands here."
        />
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => {
            const finishedAt = task.reviewedAt ?? task.updatedAt;

            return (
              <li key={task.id}>
                <Card className="py-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-medium text-zinc-100">{task.title}</p>
                    <StatusBadge status={task.status} />
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">
                    Finished{" "}
                    {finishedAt.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  {task.status !== "REJECTED" ? (
                    <p className="mt-2 text-sm text-amber-500/90">
                      Earned: {formatTaskRewards(task, { referenceTime: finishedAt })}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-zinc-500">
                      Not approved — ask your parent what to try next.
                    </p>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
