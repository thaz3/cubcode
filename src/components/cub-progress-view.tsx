import type { CubRewardSummary } from "@/lib/rewards";
import { formatMinutes } from "@/lib/ledger-labels";
import { StatCard } from "@/components/ui/stat-card";
import { cn } from "@/lib/utils";

type CubProgressViewProps = {
  summary: CubRewardSummary;
  className?: string;
};

export function CubProgressView({ summary, className }: CubProgressViewProps) {
  const atDailyCap =
    summary.phoneMinutesToday >= summary.dailyPhoneCapMinutes &&
    summary.dailyPhoneCapMinutes > 0;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="rounded-2xl border border-amber-800/60 bg-amber-950/30 p-5">
        <p className="text-sm font-medium text-amber-200/90">
          Rank · {summary.rank.current.name}
        </p>
        <p className="mt-1 text-3xl font-bold text-zinc-50">{summary.totalXp} XP</p>
        {summary.rank.next ? (
          <>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-amber-600"
                style={{ width: `${summary.rank.progressPercent}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-zinc-400">
              {summary.rank.xpToNext} XP to {summary.rank.next.name}
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm text-zinc-400">Top rank!</p>
        )}
      </div>

      <dl className="grid gap-3 sm:grid-cols-2">
        <StatCard
          label="Focus Tokens"
          value={String(summary.totalFocusTokens)}
          detail="Save up for rewards"
        />
        <StatCard
          label="Phone time today"
          value={formatMinutes(summary.phoneMinutesAvailableToday)}
          detail={
            atDailyCap
              ? "Daily cap reached — ask your parent"
              : `${formatMinutes(summary.phoneMinutesToday)} earned today`
          }
          highlight={atDailyCap ? "amber" : undefined}
        />
        <StatCard
          label="Weekend Bank"
          value={formatMinutes(summary.weekendBankMinutes)}
          detail="Extra time saved for weekends"
        />
      </dl>

      <p className="text-sm text-zinc-500">
        Your parent controls when you can use your phone. Earned time is a guide,
        not automatic access.
      </p>
    </div>
  );
}
