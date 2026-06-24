import { ReviewCard } from "@/components/review-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { auth } from "@/lib/auth";
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
      <PageHeader
        title="Review"
        subtitle={
          tasks.length > 0
            ? `${tasks.length} task${tasks.length === 1 ? "" : "s"} waiting for your decision`
            : "Parent approval inbox"
        }
        backHref="/dashboard"
        backLabel="Today"
      />

      {tasks.length === 0 ? (
        <EmptyState
          title="You're caught up"
          description="When a Cub submits a task, it will show up here for approval."
          actionLabel="View tasks"
          actionHref="/dashboard/tasks"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tasks.map((task) => (
            <ReviewCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
