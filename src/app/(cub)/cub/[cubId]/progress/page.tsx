import { CubProgressOverview } from "@/components/cub-progress-overview";
import { CubProgressView } from "@/components/cub-progress-view";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { auth } from "@/lib/auth";
import { requireCubForUser } from "@/lib/cub-access";
import { formatWeekLabel, getWeekStart } from "@/lib/council-day";
import { getCubWeekStats } from "@/lib/council-day-stats";
import { getCubLedgerEntries } from "@/lib/cub-ledger";
import { getCubRewardSummary } from "@/lib/rewards";
import { PARENT_CUB_COMPLETED_STATUSES } from "@/lib/task-transitions";
import { getCubWeekEarnedTotals } from "@/lib/weekly-progress";
import { db } from "@/lib/db";
import { seedRewardStoreForFamily } from "@/lib/actions/rewards";
import { redirect } from "next/navigation";

type CubProgressPageProps = {
  params: Promise<{ cubId: string }>;
};

export default async function CubModeProgressPage({
  params,
}: CubProgressPageProps) {
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
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My progress"
        subtitle="XP, rank, tokens, and phone time you've earned."
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
        <Card>
          <h2 className="text-lg font-semibold text-zinc-100">Reward Store</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Things you can work toward with Focus Tokens. Ask your parent to redeem.
          </p>
          <ul className="mt-4 space-y-3">
            {rewardItems.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-cub-off-white/10 bg-cub-ebony/50 px-4 py-3"
              >
                <p className="font-medium text-zinc-100">{item.title}</p>
                {item.description ? (
                  <p className="mt-1 text-sm text-zinc-400">{item.description}</p>
                ) : null}
                <p className="mt-2 text-sm text-cub-gold">
                  {item.costFocusTokens} Focus Token
                  {item.costFocusTokens === 1 ? "" : "s"}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
