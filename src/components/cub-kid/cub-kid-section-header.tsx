import { cubKidSectionEyebrow } from "@/lib/cub-kid-theme";
import { cn } from "@/lib/utils";

type CubKidSectionHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  compact?: boolean;
  className?: string;
};

export function CubKidSectionHeader({
  eyebrow,
  title,
  subtitle,
  trailing,
  compact = false,
  className,
}: CubKidSectionHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-2", className)}>
      <div className="min-w-0">
        {eyebrow ? (
          <p className={cn(cubKidSectionEyebrow, compact && "text-[9px]")}>
            {eyebrow}
          </p>
        ) : null}
        <h2
          className={cn(
            "font-black text-cub-off-white",
            compact ? "text-sm" : "text-lg sm:text-xl",
            eyebrow && "mt-0.5",
          )}
        >
          {title}
        </h2>
        {subtitle ? (
          <p className={cn("text-cub-muted", compact ? "text-[10px]" : "text-xs")}>
            {subtitle}
          </p>
        ) : null}
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  );
}
