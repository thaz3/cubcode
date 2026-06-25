import Link from "next/link";
import { CubColorBadge } from "@/components/cub-color-dot";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { TaskScheduleDisplay } from "@/components/task-schedule-display";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getFamilyForUser } from "@/lib/session";
import { formatProofType, formatTaskRewards } from "@/lib/task-labels";
import { formatTaskCategory } from "@/lib/task-categories";
import { formatTaskRecurrence } from "@/lib/task-recurrence";
import { PARENT_CUB_COMPLETED_STATUSES } from "@/lib/task-transitions";
import { notFound, redirect } from "next/navigation";

type CubCompletedTasksPageProps = {
  params: Promise<{ cubId: string }>;
};

export default async function CubCompletedTasksPage({
  params,
}: CubCompletedTasksPageProps) {
  const { cubId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const family = await getFamilyForUser(session.user.id);
  if (!family) redirect("/signup");

  const cub = family.cubs.find((c) => c.id === cubId);
  if (!cub) notFound();

  const tasks = await db.task.findMany({
    where: {
      familyId: family.id,
      cubId: cub.id,
      status: { in: PARENT_CUB_COMPLETED_STATUSES },
    },
    orderBy: [{ reviewedAt: "desc" }, { updatedAt: "desc" }],
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${cub.displayName} — completed`}
        subtitle="Finished tasks stay here so the main view stays focused on what's active."
        backHref={`/dashboard/cubs/${cub.id}/tasks`}
        backLabel="Active tasks"
      />
      <CubColorBadge cubId={cub.id} displayName={cub.displayName} />

      {tasks.length === 0 ? (
        <Card>
          <p className="text-sm text-zinc-500">No completed tasks yet.</p>
          <Link href={`/dashboard/cubs/${cub.id}/tasks`} className="mt-3 inline-block">
            <Button variant="secondary">Back to active tasks</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <Card key={task.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/tasks/${task.id}`}
                      className="text-lg font-semibold hover:text-amber-700"
                    >
                      {task.title}
                    </Link>
                    <StatusBadge status={task.status} />
                  </div>
                  <TaskScheduleDisplay task={task} className="mt-1" />
                  {task.description ? (
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {task.description}
                    </p>
                  ) : null}
                  <p className="mt-1 text-sm text-zinc-500">
                    {formatTaskCategory(task.category, {
                      subcategory: task.subcategory,
                      growthCategory: task.growthCategory,
                    })}{" "}
                    · {formatProofType(task.proofType)} · {formatTaskRewards(task)}
                    {formatTaskRecurrence(task.recurrence)
                      ? ` · ${formatTaskRecurrence(task.recurrence)}`
                      : ""}
                  </p>
                  <p className="mt-2 text-sm text-zinc-500">
                    {task.status === "COMPLETED"
                      ? "Rewards credited."
                      : task.status === "REJECTED"
                        ? "Not approved — assign a fresh task if needed."
                        : "Approved."}
                  </p>
                  {task.reviewNote ? (
                    <p className="mt-2 rounded-lg bg-zinc-900/60 p-2 text-sm text-zinc-400">
                      Parent note: {task.reviewNote}
                    </p>
                  ) : null}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
