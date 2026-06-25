import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl border border-dashed border-cub-gold/35 bg-cub-gold-muted/40 px-6 py-10 text-center shadow-inner shadow-cub-gold/5",
        className,
      )}
    >
      <p className="text-lg font-semibold text-cub-off-white">{title}</p>
      <p className="mt-2 max-w-sm text-sm text-cub-muted">{description}</p>
      {actionLabel && actionHref ? (
        <Link href={actionHref} className="mt-5 w-full max-w-xs">
          <Button variant="constructive" fullWidth size="lg">
            {actionLabel}
          </Button>
        </Link>
      ) : null}
    </div>
  );
}
