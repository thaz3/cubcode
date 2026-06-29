import { TaskDetailView } from "@/components/task-detail-view";
import { auth } from "@/lib/auth";
import { getTaskChecklistItems } from "@/lib/tasks";
import { db } from "@/lib/db";
import { getFamilyForUser } from "@/lib/session";
import { notFound, redirect } from "next/navigation";

type TaskDetailPageProps = {
  params: Promise<{ taskId: string }>;
};

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { taskId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const family = await getFamilyForUser(session.user.id);
  if (!family) redirect("/signup");

  const task = await db.task.findFirst({
    where: { id: taskId, familyId: family.id },
    include: {
      cub: true,
      template: true,
      focusBlocks: { orderBy: { startedAt: "desc" } },
    },
  });

  if (!task) notFound();

  const checklistItems = getTaskChecklistItems(task);

  return (
    <TaskDetailView
      task={task}
      familyCubs={family.cubs}
      checklistItems={checklistItems}
    />
  );
}
