import type { CubRewardSummary } from "@/lib/rewards";
import { formatMinutes } from "@/lib/ledger-labels";
import { CubKidPanel } from "@/components/cub-kid/cub-kid-panel";
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
      <CubKidPanel variant="gold" contentClassName="space-y-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cub-gold-light">
            🏅 Your rank
          </p>
          <p className="mt-1 text-sm font-bold text-cub-gold-light">
            {summary.rank.current.name}
          </p>
          <p className="mt-1 text-3xl font-black text-cub-off-white">{summary.totalXp} XP</p>
        </div>
        {summary.rank.next ? (
          <>
            <div className="h-3 overflow-hidden rounded-full bg-cub-charcoal shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 via-cub-green-bright to-cub-gold shadow-sm"
                style={{ width: `${summary.rank.progressPercent}%` }}
              />
            </div>
            <p className="text-sm text-cub-muted">
              {summary.rank.xpToNext} XP to {summary.rank.next.name}
            </p>
          </>
        ) : (
          <p className="text-sm font-bold text-cub-green-light">Top rank — legend status!</p>
        )}
      </CubKidPanel>

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
          highlight={atDailyCap ? "gold" : undefined}
        />
        <StatCard
          label="Weekend Bank"
          value={formatMinutes(summary.weekendBankMinutes)}
          detail="Extra time saved for weekends"
        />
      </dl>

      <p className="text-sm text-cub-muted">
        Your parent controls when you can use your phone. Earned time is a guide,
        not automatic access.
      </p>
    </div>
  );
}
