import type { ChallengeProgressStatus } from "@/generated/prisma/client";

export const CHALLENGE_PROGRESS_STATUS_LABELS: Record<
  ChallengeProgressStatus,
  string
> = {
  PENDING: "Not submitted",
  SUBMITTED: "Waiting for review",
  SENT_BACK: "Sent back",
  REJECTED: "Rejected",
  REWARDED: "Rewarded",
};

const TRANSITIONS: Record<ChallengeProgressStatus, ChallengeProgressStatus[]> = {
  PENDING: ["SUBMITTED"],
  SUBMITTED: ["REWARDED", "REJECTED", "SENT_BACK"],
  SENT_BACK: ["SUBMITTED"],
  REJECTED: [],
  REWARDED: [],
};

export function canChallengeTransition(
  from: ChallengeProgressStatus,
  to: ChallengeProgressStatus,
): boolean {
  return TRANSITIONS[from].includes(to);
}

export function assertChallengeTransition(
  from: ChallengeProgressStatus,
  to: ChallengeProgressStatus,
): void {
  if (!canChallengeTransition(from, to)) {
    throw new Error(`Invalid challenge progress transition: ${from} → ${to}`);
  }
}

export const REVIEW_QUEUE_CHALLENGE_STATUSES: ChallengeProgressStatus[] = [
  "SUBMITTED",
];

export const CUB_ACTIVE_CHALLENGE_LOG_STATUSES: ChallengeProgressStatus[] = [
  "PENDING",
  "SUBMITTED",
  "SENT_BACK",
];

export const MEANINGFUL_CHALLENGE_PROGRESS_STATUSES: ChallengeProgressStatus[] = [
  "SUBMITTED",
  "SENT_BACK",
  "REJECTED",
  "REWARDED",
];
