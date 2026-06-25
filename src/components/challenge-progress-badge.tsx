import type { ChallengeProgressStatus } from "@/generated/prisma/client";
import { CHALLENGE_PROGRESS_STATUS_LABELS } from "@/lib/challenge-transitions";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<ChallengeProgressStatus, string> = {
  PENDING: "bg-zinc-800 text-zinc-300",
  SUBMITTED: "bg-amber-950 text-amber-300",
  SENT_BACK: "bg-orange-950 text-orange-300",
  REJECTED: "bg-red-950 text-red-300",
  REWARDED: "bg-emerald-950 text-emerald-300",
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
