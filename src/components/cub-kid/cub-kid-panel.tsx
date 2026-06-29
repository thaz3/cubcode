import {
  cubKidPanelClass,
  cubKidPanelGlow,
  cubKidSectionEyebrow,
  cubKidTextMuted,
  type CubKidPanelVariant,
} from "@/lib/cub-kid-theme";
import { cn } from "@/lib/utils";

type CubKidPanelProps = {
  children: React.ReactNode;
  variant?: CubKidPanelVariant;
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
  return (
    <div className={cn(cubKidPanelClass(variant), "p-4 sm:p-5", className)}>
      <div className={cubKidPanelGlow} aria-hidden />
      {eyebrow ? (
        <div className="relative mb-4 text-center">
          <p className={cubKidSectionEyebrow}>{eyebrow}</p>
          {subtitle ? (
            <p className={cn("mt-0.5 text-xs", cubKidTextMuted)}>{subtitle}</p>
          ) : null}
        </div>
      ) : null}
      <div className={cn("relative", contentClassName)}>{children}</div>
    </div>
  );
}
