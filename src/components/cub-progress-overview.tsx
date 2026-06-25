import { Card } from "@/components/ui/card";
import {
  CubRecentCompletionsCarousel,
  RecentWinsSectionHeader,
} from "@/components/cub-recent-completions-carousel";
import { CubTodayEarnedSection } from "@/components/cub-today-earned-section";
import { buildCompletionFeedItems, serializeCompletionFeedItems } from "@/lib/cub-completion-feed";
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
  const feedItems = serializeCompletionFeedItems(
    buildCompletionFeedItems(ledgerEntries, completedTasks),
  );

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

      <Card
        variant="accent"
        className="relative overflow-hidden border-cub-gold/45 shadow-xl shadow-cub-gold/15"
      >
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-cub-gold/15 blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-cub-green-bright/10 blur-2xl"
          aria-hidden
        />

        <div className="relative space-y-5">
          <RecentWinsSectionHeader count={feedItems.length} />
          <CubRecentCompletionsCarousel items={feedItems} />
        </div>
      </Card>
    </div>
  );
}
