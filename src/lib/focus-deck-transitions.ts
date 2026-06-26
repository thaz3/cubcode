import type { FocusActivityCompletionStatus } from "@/generated/prisma/client";

export const FOCUS_COMPLETION_STATUS_LABELS: Record<
  FocusActivityCompletionStatus,
  string
> = {
  IN_PROGRESS: "In progress",
  SUBMITTED: "Waiting for review",
  SENT_BACK: "Sent back",
  REJECTED: "Rejected",
  REWARDED: "Rewarded",
};

const TRANSITIONS: Record<
  FocusActivityCompletionStatus,
  FocusActivityCompletionStatus[]
> = {
  IN_PROGRESS: ["SUBMITTED"],
  SUBMITTED: ["REWARDED", "REJECTED", "SENT_BACK"],
  SENT_BACK: ["SUBMITTED"],
  REJECTED: [],
  REWARDED: [],
};

export function assertFocusCompletionTransition(
  from: FocusActivityCompletionStatus,
  to: FocusActivityCompletionStatus,
): void {
  if (!TRANSITIONS[from].includes(to)) {
    throw new Error(`Invalid focus completion transition: ${from} → ${to}`);
  }
}

export const REVIEW_QUEUE_FOCUS_COMPLETION_STATUSES: FocusActivityCompletionStatus[] =
  ["SUBMITTED"];

export const CUB_ACTIVE_FOCUS_COMPLETION_STATUSES: FocusActivityCompletionStatus[] =
  ["IN_PROGRESS", "SUBMITTED", "SENT_BACK"];
