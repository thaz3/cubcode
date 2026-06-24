import type { Task, TaskStatus } from "@/generated/prisma/client";

export type CubNextAction = {
  title: string;
  description: string;
  href: string;
  buttonLabel: string;
  tone: "focus" | "urgent" | "wait" | "calm";
};

type TaskSlice = Pick<Task, "id" | "title" | "status" | "focusSessionStartedAt">;

export function getCubNextAction(
  tasks: TaskSlice[],
  cubId: string,
): CubNextAction {
  const baseTasks = `/cub/${cubId}/tasks`;

  const inProgressFocus = tasks.find(
    (t) => t.status === "IN_PROGRESS" && t.focusSessionStartedAt,
  );
  if (inProgressFocus) {
    return {
      title: `Keep going: ${inProgressFocus.title}`,
      description: "Your focus timer is running. Submit when you're done.",
      href: baseTasks,
      buttonLabel: "Continue task",
      tone: "focus",
    };
  }

  const sentBack = tasks.find((t) => t.status === "SENT_BACK");
  if (sentBack) {
    return {
      title: `Try again: ${sentBack.title}`,
      description: "Your parent asked for changes. Read their note and resubmit.",
      href: baseTasks,
      buttonLabel: "Fix task",
      tone: "urgent",
    };
  }

  const claimed = tasks.find(
    (t) => t.status === "CLAIMED" || t.status === "IN_PROGRESS",
  );
  if (claimed) {
    const label =
      claimed.status === "IN_PROGRESS" ? "Submit task" : "Start focus";
    return {
      title: claimed.title,
      description:
        claimed.status === "IN_PROGRESS"
          ? "Finish your work and submit proof for parent review."
          : "Start your focus timer when you're ready to work.",
      href: baseTasks,
      buttonLabel: label,
      tone: "focus",
    };
  }

  const waiting = tasks.find((t) => t.status === "SUBMITTED");
  if (waiting) {
    return {
      title: "Waiting for parent review",
      description: `"${waiting.title}" was submitted. Your parent will review it soon.`,
      href: baseTasks,
      buttonLabel: "View tasks",
      tone: "wait",
    };
  }

  if (tasks.length === 0) {
    return {
      title: "No tasks yet",
      description: "Ask your parent to assign something for you to work on.",
      href: baseTasks,
      buttonLabel: "Check tasks",
      tone: "calm",
    };
  }

  return {
    title: "You're all caught up",
    description: "No active tasks right now. Nice work!",
    href: `/cub/${cubId}/progress`,
    buttonLabel: "See my progress",
    tone: "calm",
  };
}

export function cubStatusMessage(status: TaskStatus): string {
  switch (status) {
    case "CLAIMED":
      return "Ready to start — tap Start focus when you're ready.";
    case "IN_PROGRESS":
      return "In progress — submit when you're done.";
    case "SUBMITTED":
      return "Submitted — waiting for parent review.";
    case "SENT_BACK":
      return "Sent back — read the note and try again.";
    case "APPROVED":
    case "COMPLETED":
      return "Approved — rewards credited!";
    case "REJECTED":
      return "Not approved this time. Ask your parent what's next.";
    default:
      return "";
  }
}
