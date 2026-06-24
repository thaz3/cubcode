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
          "border border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200",
        variant === "info" &&
          "border border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
        className,
      )}
    >
      <strong>Missed due date.</strong> This task is urgent. If approved after
      the due date, the Cub earns {OVERDUE_REWARD_PENALTY_LABEL.toLowerCase()}{" "}
      (half XP, Focus Tokens, and phone time).
    </p>
  );
}
