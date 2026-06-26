import Link from "next/link";
import {
  cubKidBackLink,
  cubKidHeroBadge,
} from "@/lib/cub-kid-theme";
import { cn } from "@/lib/utils";

type CubKidHeroProps = {
  title: string;
  subtitle?: string;
  emoji?: string;
  backHref?: string;
  backLabel?: string;
  action?: React.ReactNode;
  className?: string;
};

export function CubKidHero({
  title,
  subtitle,
  emoji = "🐾",
  backHref,
  backLabel = "Back",
  action,
  className,
}: CubKidHeroProps) {
  return (
    <header className={cn("space-y-3", className)}>
      {backHref ? (
        <Link href={backHref} className={cubKidBackLink}>
          <span aria-hidden>←</span>
          {backLabel}
        </Link>
      ) : null}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-black tracking-tight text-cub-off-white sm:text-3xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 max-w-2xl text-sm text-cub-gold-light/90 sm:text-base">
              {subtitle}
            </p>
          ) : null}
        </div>
        <div className={cubKidHeroBadge} aria-hidden>
          {emoji}
        </div>
        {action ? <div className="hidden shrink-0 sm:block">{action}</div> : null}
      </div>
      {action ? <div className="sm:hidden">{action}</div> : null}
    </header>
  );
}
