import { Card } from "@/components/ui/card";
import { CubCompletedTasksSection } from "@/components/cub-completed-tasks-section";
import { CubEarnedHistory } from "@/components/cub-earned-history";
import { CubTodayEarnedSection } from "@/components/cub-today-earned-section";
import type { CubLedgerEntry } from "@/lib/cub-ledger";
import type { CubWeekStats } from "@/lib/council-day";
import type { CubRewardSummary } from "@/lib/rewards";
import type { TaskStatus } from "@/generated/prisma/client";

type CubProgressOverviewProps = {
  cubId: string;
  weekLabel: string;
  summary: CubRewardSummary;
  weekEarned: {
    xpEarned: number;
    focusTokensEarned: number;
    phoneMinutesEarned: number;
  };
  weekStats: CubWeekStats;
  ledgerEntries: CubLedgerEntry[];
  completedTasks: Array<{
    id: string;
    title: string;
    status: TaskStatus;
    reviewedAt: Date | null;
    updatedAt: Date;
    xpEarned: number;
    focusTokensEarned: number;
    phoneMinutesEarned: number;
    focusMinutesEarned: number;
    dueAt: Date | null;
    submittedAt: Date | null;
  }>;
};

export function CubProgressOverview({
  cubId,
  weekLabel,
  summary,
  weekEarned,
  weekStats,
  ledgerEntries,
  completedTasks,
}: CubProgressOverviewProps) {
  return (
    <div className="space-y-6">
      <CubTodayEarnedSection
        cubId={cubId}
        weekLabel={weekLabel}
        summary={summary}
        weekEarned={weekEarned}
        weekStats={weekStats}
        showProgressLink={false}
      />

      <Card className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">What you&apos;ve earned</h2>
          <p className="mt-1 text-sm text-zinc-500">
            XP, tokens, phone time, and Weekend Bank from approved tasks and bonuses.
          </p>
        </div>
        <CubEarnedHistory entries={ledgerEntries} />
      </Card>

      <CubCompletedTasksSection tasks={completedTasks} />
    </div>
  );
}
