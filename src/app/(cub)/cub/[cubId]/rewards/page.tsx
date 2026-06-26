import { CubProgressOverview } from "@/components/cub-progress-overview";
import { CubProgressView } from "@/components/cub-progress-view";
import { CubRewardStore } from "@/components/cub-reward-store";
import { CubKidHero, CubKidPanel } from "@/components/cub-kid";
import { auth } from "@/lib/auth";
import { requireCubForUser } from "@/lib/cub-access";
import { formatWeekLabel, getWeekStart } from "@/lib/council-day";
import { CUB_PAGE_EMOJI } from "@/lib/cub-kid-theme";
import { getCubWeekStats } from "@/lib/council-day-stats";
import { getCubLedgerEntries } from "@/lib/cub-ledger";
import { getCubRewardSummary } from "@/lib/rewards";
import { getCubPendingRewardRedemptionRequests, getCubDeclinedRewardRedemptionNotes } from "@/lib/pending-reward-redemptions";
import { PARENT_CUB_COMPLETED_STATUSES } from "@/lib/task-transitions";
import { getCubWeekEarnedTotals } from "@/lib/weekly-progress";
import { db } from "@/lib/db";
import { seedRewardStoreForFamily } from "@/lib/actions/rewards";
import { redirect } from "next/navigation";

type CubRewardsPageProps = {
  params: Promise<{ cubId: string }>;
};

export default async function CubRewardsPage({ params }: CubRewardsPageProps) {
  const { cubId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { cub, familyId } = await requireCubForUser(cubId, session.user.id);
  const weekStartsOn = getWeekStart();

  await seedRewardStoreForFamily(familyId);

  const [
    summary,
    rewardItems,
    weekEarned,
    weekStats,
    ledgerEntries,
    completedTasks,
    pendingRedemptions,
    declinedNotesMap,
  ] = await Promise.all([
    getCubRewardSummary(cub),
    db.rewardStoreItem.findMany({
      where: { familyId, isActive: true },
      orderBy: { costFocusTokens: "asc" },
      select: {
        id: true,
        title: true,
        description: true,
        costFocusTokens: true,
        grantType: true,
        minutesGranted: true,
      },
    }),
    getCubWeekEarnedTotals(cub.id, weekStartsOn),
    getCubWeekStats(cub.id, weekStartsOn),
    getCubLedgerEntries(cub.id, { limit: 40 }),
    db.task.findMany({
      where: {
        familyId,
        cubId: cub.id,
        status: { in: PARENT_CUB_COMPLETED_STATUSES },
      },
      orderBy: [{ reviewedAt: "desc" }, { updatedAt: "desc" }],
      take: 10,
      select: {
        id: true,
        title: true,
        status: true,
        reviewedAt: true,
        updatedAt: true,
        xpEarned: true,
        focusTokensEarned: true,
        phoneMinutesEarned: true,
        focusMinutesEarned: true,
        dueAt: true,
        submittedAt: true,
      },
    }),
    getCubPendingRewardRedemptionRequests(cub.id, familyId),
    getCubDeclinedRewardRedemptionNotes(cub.id, familyId),
  ]);

  const declinedNotes = Object.fromEntries(declinedNotesMap);

  return (
    <div className="space-y-5">
      <CubKidHero
        title="Rewards"
        subtitle="What you've earned, finished work, and things to save up for."
        emoji={CUB_PAGE_EMOJI.rewards}
        backHref={`/cub/${cubId}`}
        backLabel="Today"
      />

      <CubProgressView summary={summary} />

      <CubProgressOverview
        cubId={cubId}
        weekLabel={formatWeekLabel(weekStartsOn)}
        summary={summary}
        weekEarned={weekEarned}
        weekStats={weekStats}
        ledgerEntries={ledgerEntries}
        completedTasks={completedTasks}
      />

      {rewardItems.length > 0 ? (
        <CubKidPanel variant="gold" contentClassName="space-y-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cub-gold-light">
              🛒 Reward store
            </p>
            <h2 className="mt-1 text-lg font-black text-cub-off-white">Spend your tokens</h2>
            <p className="mt-1 text-sm text-cub-muted">
              Pick a reward, then ask your parent to approve it. Tokens spend when
              they say yes.
            </p>
          </div>
          <CubRewardStore
            cubId={cubId}
            availableFocusTokens={summary.totalFocusTokens}
            items={rewardItems}
            pendingItemIds={pendingRedemptions.map(
              (request: { rewardStoreItem: { id: string } }) =>
                request.rewardStoreItem.id,
            )}
            declinedNotes={declinedNotes}
          />
        </CubKidPanel>
      ) : null}
    </div>
  );
}
