import { OVERDUE_REWARD_PENALTY_LABEL } from "@/lib/task-rewards";
import { cn } from "@/lib/utils";

type OverduePenaltyNoticeProps = {
  className?: string;
  variant?: "warning" | "info";
};

export function OverduePenaltyNotice({
  className,
  variant = "warning",
}: OverduePenaltyNoticeProps) {
  return (
    <p
      className={cn(
        "rounded-lg p-3 text-sm",
        variant === "warning" &&
          "border border-cub-red/40 bg-cub-red-muted text-cub-off-white",
        variant === "info" &&
          "border border-cub-gold/40 bg-cub-gold-muted text-cub-off-white",
        className,
      )}
    >
      <strong>Missed due date.</strong> This task is urgent. If approved after
      the due date, the Cub earns {OVERDUE_REWARD_PENALTY_LABEL.toLowerCase()}{" "}
      (half XP, Focus Tokens, and phone time).
    </p>
  );
}
