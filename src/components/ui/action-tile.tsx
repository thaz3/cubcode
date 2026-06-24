import Link from "next/link";
import { cn } from "@/lib/utils";

type ActionTileProps = {
  href: string;
  label: string;
  description?: string;
  badge?: string | number;
  className?: string;
};

export function ActionTile({
  href,
  label,
  description,
  badge,
  className,
}: ActionTileProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 transition hover:border-zinc-700 active:bg-zinc-800",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="font-medium text-zinc-100">{label}</p>
        {description ? (
          <p className="mt-0.5 truncate text-sm text-zinc-400">{description}</p>
        ) : null}
      </div>
      {badge != null ? (
        <span className="inline-flex min-h-7 min-w-7 shrink-0 items-center justify-center rounded-full bg-amber-600 px-2 text-xs font-semibold text-white">
          {badge}
        </span>
      ) : (
        <span className="shrink-0 text-zinc-500" aria-hidden>
          →
        </span>
      )}
    </Link>
  );
}
