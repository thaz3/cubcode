import { cubKidTipCard } from "@/lib/cub-kid-theme";
import { cn } from "@/lib/utils";

type CubKidTipCardProps = {
  title: string;
  children: React.ReactNode;
  emoji?: string;
  className?: string;
};

export function CubKidTipCard({
  title,
  children,
  emoji = "💡",
  className,
}: CubKidTipCardProps) {
  return (
    <div className={cn(cubKidTipCard, className)}>
      <p className="text-sm font-black text-kid-ink">
        {emoji} {title}
      </p>
      <div className="mt-1 text-xs text-kid-ink-muted">{children}</div>
    </div>
  );
}
