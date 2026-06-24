import { getCubColor } from "@/lib/cub-colors";
import { cn } from "@/lib/utils";

type CubColorDotProps = {
  cubId: string;
  className?: string;
  size?: "sm" | "md";
};

export function CubColorDot({
  cubId,
  className,
  size = "sm",
}: CubColorDotProps) {
  const colors = getCubColor(cubId);

  return (
    <span
      aria-hidden
      className={cn(
        "inline-block shrink-0 rounded-full",
        size === "sm" ? "h-2.5 w-2.5" : "h-3.5 w-3.5",
        colors.dot,
        className,
      )}
    />
  );
}

type CubColorBadgeProps = {
  cubId: string;
  displayName: string;
  className?: string;
};

export function CubColorBadge({
  cubId,
  displayName,
  className,
}: CubColorBadgeProps) {
  const colors = getCubColor(cubId);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        colors.badge,
        className,
      )}
    >
      <CubColorDot cubId={cubId} />
      {displayName}
    </span>
  );
}
