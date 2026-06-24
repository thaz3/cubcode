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
        "flex flex-col items-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 px-6 py-10 text-center",
        className,
      )}
    >
      <p className="text-lg font-semibold text-zinc-100">{title}</p>
      <p className="mt-2 max-w-sm text-sm text-zinc-400">{description}</p>
      {actionLabel && actionHref ? (
        <Link href={actionHref} className="mt-5 w-full max-w-xs">
          <Button fullWidth size="lg">
            {actionLabel}
          </Button>
        </Link>
      ) : null}
    </div>
  );
}
