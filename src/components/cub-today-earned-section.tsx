import Link from "next/link";
import { StatCard } from "@/components/ui/stat-card";
import type { CubRewardSummary } from "@/lib/rewards";
import { formatMinutes } from "@/lib/ledger-labels";
import type { CubWeekStats } from "@/lib/council-day";
import { cubKidSectionTitle, cubKidTextMuted } from "@/lib/cub-kid-theme";
import { cn } from "@/lib/utils";

type CubTodayEarnedSectionProps = {
  cubId: string;
  weekLabel: string;
  summary: CubRewardSummary;
  weekEarned: {
    xpEarned: number;
    focusTokensEarned: number;
    phoneMinutesEarned: number;
  };
  weekStats: CubWeekStats;
  showProgressLink?: boolean;
};

export function CubTodayEarnedSection({
  cubId,
  weekLabel,
  summary,
  weekEarned,
  weekStats,
  showProgressLink = true,
}: CubTodayEarnedSectionProps) {
  const focusTokenDetail =
    weekEarned.focusTokensEarned > 0
      ? `+${weekEarned.focusTokensEarned} this week · ${summary.totalFocusTokens} saved`
      : `${summary.totalFocusTokens} saved up`;

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className={cn("text-lg", cubKidSectionTitle)}>So far this week</h2>
          <p className={cn("text-sm", cubKidTextMuted)}>{weekLabel}</p>
        </div>
        {showProgressLink ? (
          <Link
            href={`/cub/${cubId}/rewards`}
            className="shrink-0 text-sm font-black text-kid-purple hover:text-kid-pink"
          >
            All rewards →
          </Link>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Focus tokens"
          value={
            weekEarned.focusTokensEarned > 0
              ? `+${weekEarned.focusTokensEarned}`
              : String(summary.totalFocusTokens)
          }
          detail={focusTokenDetail}
          highlight={weekEarned.focusTokensEarned > 0 ? "gold" : undefined}
        />
        <StatCard
          label="Weekend bank"
          value={formatMinutes(summary.weekendBankMinutes)}
          detail="Extra time saved for weekends"
          highlight="gold"
        />
        <StatCard
          label="Tasks done"
          value={String(weekStats.completedTasks)}
          detail={
            weekStats.submittedAwaitingReview > 0
              ? `${weekStats.submittedAwaitingReview} waiting for parent review`
              : "Approved this week"
          }
          highlight={weekStats.completedTasks > 0 ? "green" : undefined}
        />
        <StatCard
          label="Phone time earned"
          value={formatMinutes(weekEarned.phoneMinutesEarned)}
          detail={
            weekEarned.xpEarned > 0
              ? `+${weekEarned.xpEarned} XP this week`
              : "From approved tasks"
          }
          highlight="gold"
        />
      </div>
    </section>
  );
}
