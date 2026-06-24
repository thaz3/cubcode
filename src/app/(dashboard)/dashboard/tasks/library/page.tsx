import Link from "next/link";
import { CreateOneOffTaskForm } from "@/components/create-one-off-task-form";
import { TaskLibraryWorkflow } from "@/components/task-board-workflow";
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

      <Card>
        <h2 className="text-sm font-semibold text-zinc-100">Create new task</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Add a task to the library, then assign it to a Cub.
        </p>
        <div className="mt-4">
          <CreateOneOffTaskForm compact />
        </div>
      </Card>

      <TaskLibraryWorkflow tasks={libraryTasks} cubs={family.cubs} />
    </div>
  );
}
