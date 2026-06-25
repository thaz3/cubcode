import Link from "next/link";
import { TaskBoardNav } from "@/components/task-board-nav";
import { TaskBoardWorkflow } from "@/components/task-board-workflow";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTaskBoardSectionCounts } from "@/lib/task-board-sections";
import { getFamilyForUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function TaskBoardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const family = await getFamilyForUser(session.user.id);
  if (!family) redirect("/signup");

  const tasks = await db.task.findMany({
    where: {
      familyId: family.id,
      status: { not: "AVAILABLE" },
    },
    include: { cub: true },
    orderBy: [{ updatedAt: "desc" }],
  });

  const pendingReviewCount = tasks.filter((t) => t.status === "SUBMITTED").length;
  const sectionCounts = getTaskBoardSectionCounts(tasks);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        subtitle="What you assigned, what's in progress, submitted, and completed."
        action={
          <div className="flex flex-wrap gap-2">
            {pendingReviewCount > 0 ? (
              <Link href="/dashboard/tasks/review">
                <Button size="lg">Review ({pendingReviewCount})</Button>
              </Link>
            ) : null}
            <Link href="/dashboard/create">
              <Button size="lg">Create</Button>
            </Link>
            <Link href="/dashboard/tasks/library">
              <Button variant="secondary" size="lg">
                Task library
              </Button>
            </Link>
          </div>
        }
      />

      <div className="sticky top-14 z-10 -mx-4 border-b border-cub-off-white/10 bg-cub-ebony/95 px-4 pb-3 backdrop-blur lg:top-16">
        <TaskBoardNav counts={sectionCounts} />
      </div>

      <TaskBoardWorkflow
        tasks={tasks}
        pendingReviewCount={pendingReviewCount}
      />
    </div>
  );
}
