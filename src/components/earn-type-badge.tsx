import type { EarnType } from "@/lib/earn-types";
import { getEarnTypeMeta } from "@/lib/earn-types";
import { cn } from "@/lib/utils";

type EarnTypeBadgeProps = {
  earnType: EarnType;
  size?: "sm" | "md";
  className?: string;
};

export function EarnTypeBadge({
  earnType,
  size = "sm",
  className,
}: EarnTypeBadgeProps) {
  const meta = getEarnTypeMeta(earnType);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full font-semibold uppercase tracking-wide",
        meta.badgeClass,
        size === "sm"
          ? "px-2 py-0.5 text-[10px]"
          : "px-2.5 py-1 text-xs",
        className,
      )}
    >
      {meta.shortLabel}
    </span>
  );
}
