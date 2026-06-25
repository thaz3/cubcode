import type { ChallengeProgressStatus } from "@/generated/prisma/client";
import { cubStatusBadge } from "@/lib/cub-theme";
import { CHALLENGE_PROGRESS_STATUS_LABELS } from "@/lib/challenge-transitions";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<ChallengeProgressStatus, string> = {
  PENDING: cubStatusBadge.pending,
  SUBMITTED: cubStatusBadge.submitted,
  SENT_BACK: cubStatusBadge.sentBack,
  REJECTED: cubStatusBadge.rejected,
  REWARDED: cubStatusBadge.rewarded,
};

type ChallengeProgressBadgeProps = {
  status: ChallengeProgressStatus;
  className?: string;
};

export function ChallengeProgressBadge({
  status,
  className,
}: ChallengeProgressBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
        STATUS_STYLES[status],
        className,
      )}
    >
      {CHALLENGE_PROGRESS_STATUS_LABELS[status]}
    </span>
  );
}
