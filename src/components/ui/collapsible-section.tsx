import { cn } from "@/lib/utils";

type CollapsibleSectionProps = {
  title: string;
  summary?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
};

export function CollapsibleSection({
  title,
  summary,
  defaultOpen = false,
  children,
  className,
}: CollapsibleSectionProps) {
  return (
    <details
      className={cn(
        "group rounded-xl border border-cub-off-white/10 bg-zinc-900/40",
        className,
      )}
      open={defaultOpen || undefined}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 marker:content-none [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-100">{title}</p>
          {summary ? (
            <p className="mt-0.5 truncate text-xs text-zinc-500">{summary}</p>
          ) : null}
        </div>
        <span className="shrink-0 text-xs text-zinc-500 transition group-open:rotate-180">
          ▾
        </span>
      </summary>
      <div className="border-t border-cub-off-white/10 px-4 py-4">{children}</div>
    </details>
  );
}
