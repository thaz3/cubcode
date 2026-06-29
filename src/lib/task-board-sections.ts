import type { TaskStatus } from "@/generated/prisma/client";
import type { TaskWithCub } from "@/lib/task-groups";

export type TaskBoardSectionId =
  | "assigned"
  | "active"
  | "in-review"
  | "completed";

/** Hash targets for the assignments board pill nav + dropdown sections. */
export const TASK_BOARD_HASH_SECTIONS = [
  "library",
  "waiting-to-start",
  "routines",
  "active",
  "in-review",
  "completed",
] as const;

export type TaskBoardHashSection = (typeof TASK_BOARD_HASH_SECTIONS)[number];

export function isTaskBoardHashSection(
  value: string,
): value is TaskBoardHashSection {
  return (TASK_BOARD_HASH_SECTIONS as readonly string[]).includes(value);
}

export const TASK_BOARD_SECTIONS: Array<{
  id: TaskBoardSectionId;
  title: string;
  description: string;
  statuses: TaskStatus[];
}> = [
  {
    id: "assigned",
    title: "Waiting to start",
    description: "Assigned to a Cub — they have not started yet.",
    statuses: ["CLAIMED"],
  },
  {
    id: "active",
    title: "In progress",
    description: "Cubs are working on these now.",
    statuses: ["IN_PROGRESS", "SENT_BACK"],
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
  const assigned = tasks.filter((task) => task.status === "CLAIMED");
  const active = tasks.filter((task) =>
    (["IN_PROGRESS", "SENT_BACK"] as TaskStatus[]).includes(task.status),
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

  return { assigned, active, inReview, completed };
}

export function partitionLibraryTasks(tasks: TaskWithCub[]) {
  return tasks.filter((task) => task.status === "AVAILABLE");
}

export function getTaskBoardSectionCounts(
  tasks: TaskWithCub[],
  pendingReviewTotal?: number,
) {
  const { assigned, active, inReview, completed } =
    partitionTasksByBoardSection(tasks);

  return {
    assigned: assigned.length,
    active: active.length,
    "in-review": pendingReviewTotal ?? inReview.length,
    completed: completed.length,
  };
}
