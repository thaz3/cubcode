import { cubKidStatBar } from "@/lib/cub-kid-theme";
import { cn } from "@/lib/utils";

type CubKidStatBarProps = {
  leftIcon?: string;
  leftTitle: string;
  leftSubtitle?: string;
  rightIcon?: string;
  rightLabel?: string;
  rightValue?: string | number;
  className?: string;
};

export function CubKidStatBar({
  leftIcon = "⭐",
  leftTitle,
  leftSubtitle,
  rightIcon = "💎",
  rightLabel = "Your XP",
  rightValue,
  className,
}: CubKidStatBarProps) {
  return (
    <div className={cn(cubKidStatBar, className)}>
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-kid-yellow/50 bg-kid-yellow/30 text-xl shadow-inner">
          {leftIcon}
        </span>
        <div>
          <p className="text-sm font-black text-kid-ink">{leftTitle}</p>
          {leftSubtitle ? (
            <p className="text-xs font-semibold text-kid-ink-muted">{leftSubtitle}</p>
          ) : null}
        </div>
      </div>
      {rightValue !== undefined ? (
        <div className="flex items-center gap-2 rounded-2xl border-2 border-kid-purple/25 bg-kid-lavender/60 px-3 py-2">
          <span className="text-lg" aria-hidden>
            {rightIcon}
          </span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wide text-kid-purple">
              {rightLabel}
            </p>
            <p className="text-sm font-black text-kid-ink">{rightValue}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
