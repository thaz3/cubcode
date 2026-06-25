import Link from "next/link";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  action?: React.ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  subtitle,
  backHref,
  backLabel = "Back",
  action,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("space-y-2", className)}>
      {backHref ? (
        <Link
          href={backHref}
          className="inline-flex min-h-11 items-center text-sm font-medium text-cub-gold-light hover:text-cub-gold-warm"
        >
          ← {backLabel}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-cub-off-white sm:text-3xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 max-w-2xl text-base text-cub-gold-light/90">
              {subtitle}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </header>
  );
}
