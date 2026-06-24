import Link from "next/link";
import { TaskStatusBadge } from "@/components/task-status-badge";
import { CubLink } from "@/components/cub-link";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { formatProofType } from "@/lib/task-labels";
import { db } from "@/lib/db";
import { getFamilyForUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function TaskReviewQueuePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const family = await getFamilyForUser(session.user.id);
  if (!family) redirect("/signup");

  const tasks = await db.task.findMany({
    where: { familyId: family.id, status: "SUBMITTED" },
    include: { cub: true },
    orderBy: { submittedAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/tasks" className="text-sm font-medium text-amber-700">
          ← Task Board
        </Link>
        <h1 className="mt-2 text-3xl font-bold">Review queue</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Submitted tasks waiting for your review.
        </p>
      </div>

      {tasks.length === 0 ? (
        <Card>
          <p className="text-sm text-zinc-500">Nothing to review right now.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <Card key={task.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">{task.title}</h2>
                    <TaskStatusBadge status={task.status} />
                  </div>
                  <p className="mt-1 text-sm text-zinc-500">
                    {task.cub ? (
                      <>
                        <CubLink
                          cubId={task.cub.id}
                          displayName={task.cub.displayName}
                          className="text-sm font-medium text-amber-700 hover:underline dark:text-amber-400"
                        />{" "}
                        · {formatProofType(task.proofType)}
                      </>
                    ) : (
                      <>Unknown Cub · {formatProofType(task.proofType)}</>
                    )}
                  </p>
                  {task.submittedAt ? (
                    <p className="mt-1 text-xs text-zinc-400">
                      Submitted {task.submittedAt.toLocaleString()}
                    </p>
                  ) : null}
                </div>
                <Link
                  href={`/dashboard/tasks/review/${task.id}`}
                  className="text-sm font-medium text-amber-700"
                >
                  Review →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
