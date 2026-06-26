import {
  cubKidPanelGlow,
  cubKidPanelGold,
  cubKidPanelViolet,
  cubKidSectionEyebrow,
} from "@/lib/cub-kid-theme";
import { cn } from "@/lib/utils";

type CubKidPanelProps = {
  children: React.ReactNode;
  variant?: "violet" | "gold";
  eyebrow?: string;
  subtitle?: string;
  className?: string;
  contentClassName?: string;
};

export function CubKidPanel({
  children,
  variant = "violet",
  eyebrow,
  subtitle,
  className,
  contentClassName,
}: CubKidPanelProps) {
  const shell = variant === "gold" ? cubKidPanelGold : cubKidPanelViolet;

  return (
    <div className={cn(shell, "p-4 sm:p-5", className)}>
      <div className={cubKidPanelGlow} aria-hidden />
      {eyebrow ? (
        <div className="relative mb-4 text-center">
          <p className={cubKidSectionEyebrow}>{eyebrow}</p>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-cub-muted">{subtitle}</p>
          ) : null}
        </div>
      ) : null}
      <div className={cn("relative", contentClassName)}>{children}</div>
    </div>
  );
}
