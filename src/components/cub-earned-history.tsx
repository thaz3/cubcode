import {
  formatGroupedEarnedRewards,
  groupCubLedgerEntries,
  type CubLedgerEntry,
} from "@/lib/cub-ledger";
import { cn } from "@/lib/utils";

type CubEarnedHistoryProps = {
  entries: CubLedgerEntry[];
  className?: string;
  emptyMessage?: string;
  limit?: number;
};

export function CubEarnedHistory({
  entries,
  className,
  emptyMessage = "Nothing earned yet. Finish tasks and get parent approval to see rewards here.",
  limit = 12,
}: CubEarnedHistoryProps) {
  const grouped = groupCubLedgerEntries(entries).slice(0, limit);
  const rewardsLine = (rewards: ReturnType<typeof groupCubLedgerEntries>[number]["rewards"]) => {
    const formatted = formatGroupedEarnedRewards(rewards);
    return formatted || "Earned";
  };

  if (grouped.length === 0) {
    return <p className={cn("text-sm text-zinc-500", className)}>{emptyMessage}</p>;
  }

  return (
    <ul className={cn("space-y-2", className)}>
      {grouped.map((group) => (
        <li
          key={group.id}
          className="rounded-xl border border-cub-off-white/10 bg-cub-ebony/50 px-4 py-3"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="font-medium text-zinc-100">{group.title}</p>
            <span className="shrink-0 text-xs text-zinc-500">
              {group.createdAt.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          <p className="mt-1.5 text-sm font-semibold text-cub-gold/90">
            {rewardsLine(group.rewards)}
          </p>
          <p className="mt-1 text-xs text-zinc-400">{group.label}</p>
        </li>
      ))}
    </ul>
  );
}
