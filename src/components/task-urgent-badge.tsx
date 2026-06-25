import { cn } from "@/lib/utils";

export function TaskUrgentBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full bg-cub-red px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-cub-off-white",
        className,
      )}
    >
      Urgent
    </span>
  );
}
