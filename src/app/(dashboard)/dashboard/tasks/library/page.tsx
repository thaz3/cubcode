import Link from "next/link";
import { TaskChallengeExplainer } from "@/components/task-challenge-explainer";
import { TaskLibraryWorkflow } from "@/components/task-board-workflow";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { partitionLibraryTasks } from "@/lib/task-board-sections";
import { getFamilyForUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function TaskLibraryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const family = await getFamilyForUser(session.user.id);
  if (!family) redirect("/signup");

  const tasks = await db.task.findMany({
    where: { familyId: family.id, status: "AVAILABLE" },
    include: { cub: true },
    orderBy: [{ updatedAt: "desc" }],
  });

  const libraryTasks = partitionLibraryTasks(tasks);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Task library"
        subtitle="Unassigned tasks ready to assign. Your main task board shows only assigned and in-progress work."
        action={
          <Link
            href="/dashboard/tasks"
            className="text-sm font-medium text-amber-500 hover:text-amber-400"
          >
            ← Back to tasks
          </Link>
        }
      />

      <TaskChallengeExplainer />

      <Card className="space-y-4 p-4 sm:p-5">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">Create something new</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Use one screen to add a one-time task or a repeating routine.
          </p>
        </div>
        <Link href="/dashboard/create">
          <Button fullWidth size="lg">
            Create task or routine
          </Button>
        </Link>
      </Card>

      <TaskLibraryWorkflow tasks={libraryTasks} cubs={family.cubs} />
    </div>
  );
}
