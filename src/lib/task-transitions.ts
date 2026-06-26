import type { TaskStatus } from "@/generated/prisma/client";

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  AVAILABLE: "Available",
  CLAIMED: "Assigned",
  IN_PROGRESS: "In Progress",
  SUBMITTED: "Waiting for review",
  SENT_BACK: "Sent Back",
  REJECTED: "Rejected",
  APPROVED: "Approved",
  COMPLETED: "Completed",
};

const TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  AVAILABLE: ["CLAIMED"],
  CLAIMED: ["IN_PROGRESS"],
  IN_PROGRESS: ["SUBMITTED"],
  SUBMITTED: ["APPROVED", "REJECTED", "SENT_BACK"],
  SENT_BACK: ["IN_PROGRESS", "SUBMITTED"],
  REJECTED: [],
  APPROVED: ["COMPLETED"],
  COMPLETED: [],
};

export function canTransition(from: TaskStatus, to: TaskStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function assertTransition(from: TaskStatus, to: TaskStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid task transition: ${from} → ${to}`);
  }
}

export const M2_TERMINAL_STATUSES: TaskStatus[] = ["REJECTED", "APPROVED"];

export const REVIEW_QUEUE_STATUSES: TaskStatus[] = ["SUBMITTED"];

export const ACTIVE_CUB_STATUSES: TaskStatus[] = [
  "CLAIMED",
  "IN_PROGRESS",
  "SUBMITTED",
  "SENT_BACK",
];

export const PARENT_CUB_COMPLETED_STATUSES: TaskStatus[] = [
  "COMPLETED",
  "APPROVED",
  "REJECTED",
];

/** Parent can edit assignment details in any workflow state. */
export const EDITABLE_TASK_STATUSES: TaskStatus[] = [
  "AVAILABLE",
  "CLAIMED",
  "IN_PROGRESS",
  "SENT_BACK",
  "SUBMITTED",
  "APPROVED",
  "REJECTED",
  "COMPLETED",
];

export function isTaskEditable(status: TaskStatus): boolean {
  return EDITABLE_TASK_STATUSES.includes(status);
}
