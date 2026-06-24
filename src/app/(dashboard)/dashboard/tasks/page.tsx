import Link from "next/link";
import { TaskBoardNav } from "@/components/task-board-nav";
import { TaskBoardWorkflow } from "@/components/task-board-workflow";
import { Button } from "@/components/ui/button";
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
    where: { familyId: family.id },
    include: { cub: true },
    orderBy: [{ updatedAt: "desc" }],
  });

  const pendingReviewCount = tasks.filter((t) => t.status === "SUBMITTED").length;
  const sectionCounts = getTaskBoardSectionCounts(tasks);

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 -mx-4 border-b border-zinc-200 bg-white/95 px-4 pb-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
        <div className="flex flex-wrap items-start justify-between gap-4 pt-1">
          <div>
            <h1 className="text-3xl font-bold">Assignment board</h1>
            <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
              Track tasks from creation through completion. Use the{" "}
              <Link href="/dashboard/tasks/templates" className="text-amber-700">
                template board
              </Link>{" "}
              to build reusable tasks, then assign them here.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/tasks/templates">
              <Button variant="secondary">Template board</Button>
            </Link>
            <Link href="/dashboard/tasks/review">
              <Button>Review queue</Button>
            </Link>
          </div>
        </div>
        <TaskBoardNav counts={sectionCounts} />
      </div>

      <TaskBoardWorkflow
        tasks={tasks}
        cubs={family.cubs}
        pendingReviewCount={pendingReviewCount}
      />
    </div>
  );
}
