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
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cub-gold-muted text-xl shadow-inner shadow-cub-gold/20">
          {leftIcon}
        </span>
        <div>
          <p className="text-sm font-bold text-cub-off-white">{leftTitle}</p>
          {leftSubtitle ? (
            <p className="text-xs text-cub-gold-light/90">{leftSubtitle}</p>
          ) : null}
        </div>
      </div>
      {rightValue !== undefined ? (
        <div className="flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-950/40 px-3 py-2">
          <span className="text-lg" aria-hidden>
            {rightIcon}
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-violet-300">
              {rightLabel}
            </p>
            <p className="text-sm font-black text-cub-off-white">{rightValue}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
