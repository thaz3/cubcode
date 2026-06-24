import type { TaskStatus } from "@/generated/prisma/client";
import type { TaskWithCub } from "@/lib/task-groups";

export type TaskBoardSectionId =
  | "assignment"
  | "active"
  | "in-review"
  | "completed";

export const TASK_BOARD_SECTIONS: Array<{
  id: TaskBoardSectionId;
  title: string;
  description: string;
  statuses: TaskStatus[];
}> = [
  {
    id: "assignment",
    title: "Created",
    description:
      "Unassigned tasks on the assignment board. Pick a Cub and assign when ready.",
    statuses: ["AVAILABLE"],
  },
  {
    id: "active",
    title: "Active",
    description: "Assigned work in progress — not yet submitted for review.",
    statuses: ["CLAIMED", "IN_PROGRESS", "SENT_BACK"],
  },
  {
    id: "in-review",
    title: "In review",
    description: "Submitted and waiting for parent approval.",
    statuses: ["SUBMITTED"],
  },
  {
    id: "completed",
    title: "Completed",
    description: "Finished tasks — approved and credited, or rejected.",
    statuses: ["COMPLETED", "REJECTED", "APPROVED"],
  },
];

export function partitionTasksByBoardSection(tasks: TaskWithCub[]) {
  const created = tasks.filter((task) => task.status === "AVAILABLE");
  const active = tasks.filter((task) =>
    (["CLAIMED", "IN_PROGRESS", "SENT_BACK"] as TaskStatus[]).includes(
      task.status,
    ),
  );
  const inReview = tasks.filter((task) => task.status === "SUBMITTED");
  const completed = tasks.filter((task) =>
    (["COMPLETED", "REJECTED", "APPROVED"] as TaskStatus[]).includes(
      task.status,
    ),
  );

  completed.sort((a, b) => {
    const aTime = a.reviewedAt?.getTime() ?? a.updatedAt.getTime();
    const bTime = b.reviewedAt?.getTime() ?? b.updatedAt.getTime();
    return bTime - aTime;
  });

  return { created, active, inReview, completed };
}

export function getTaskBoardSectionCounts(tasks: TaskWithCub[]) {
  const { created, active, inReview, completed } =
    partitionTasksByBoardSection(tasks);

  return {
    assignment: created.length,
    active: active.length,
    "in-review": inReview.length,
    completed: completed.length,
  };
}
