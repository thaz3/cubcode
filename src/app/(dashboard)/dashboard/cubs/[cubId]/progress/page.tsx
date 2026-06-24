import Link from "next/link";
import { CubLedgerHistory } from "@/components/cub-ledger-history";
import { CubProgressSummary } from "@/components/cub-progress-summary";
import { CubRedemptionHistory } from "@/components/cub-redemption-history";
import { RewardStoreList } from "@/components/reward-store-list";
import { Card } from "@/components/ui/card";
import { CubColorBadge } from "@/components/cub-color-dot";
import { seedRewardStoreForFamily } from "@/lib/actions/rewards";
import { auth } from "@/lib/auth";
import { getCubLedgerEntriesGrouped } from "@/lib/cub-ledger";
import { db } from "@/lib/db";
import { getCubRewardSummary } from "@/lib/rewards";
import { getFamilyForUser } from "@/lib/session";
import { notFound, redirect } from "next/navigation";

type CubProgressPageProps = {
  params: Promise<{ cubId: string }>;
};

export default async function CubProgressPage({ params }: CubProgressPageProps) {
  const { cubId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const family = await getFamilyForUser(session.user.id);
  if (!family) redirect("/signup");

  const cub = family.cubs.find((item) => item.id === cubId);
  if (!cub) notFound();

  await seedRewardStoreForFamily(family.id);

  const [
    summary,
    rewardItems,
    ledgerGrouped,
    redemptions,
  ] = await Promise.all([
    getCubRewardSummary(cub),
    db.rewardStoreItem.findMany({
      where: { familyId: family.id, isActive: true },
      orderBy: { costFocusTokens: "asc" },
      select: {
        id: true,
        title: true,
        description: true,
        costFocusTokens: true,
        grantType: true,
        minutesGranted: true,
        isActive: true,
      },
    }),
    getCubLedgerEntriesGrouped(cub.id, { limit: 20 }),
    db.rewardRedemption.findMany({
      where: { cubId: cub.id },
      include: { rewardStoreItem: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const {
    xpEntries,
    focusTokenEntries,
    phoneEntries,
    weekendBankEntries,
  } = ledgerGrouped;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard/cubs"
          className="text-sm font-medium text-amber-700"
        >
          ← Cubs
        </Link>
        <h1 className="mt-2 text-3xl font-bold">{cub.displayName}&apos;s progress</h1>
        <div className="mt-2">
          <CubColorBadge cubId={cub.id} displayName={cub.displayName} />
        </div>
        <p className="mt-2 text-amber-800 dark:text-amber-300">
          Parent-supervised view · earned XP, tokens, and phone time
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          C.U.B. Code calculates earned digital freedom. You control device access.
        </p>
      </div>

      <Card>
        <CubProgressSummary summary={summary} cubName={cub.displayName} />
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">{cub.displayName}&apos;s task history</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Rewards earned from tasks, Family Day, and the store — with links back
          to each item.
        </p>
        <div className="mt-4">
          <CubLedgerHistory
            cubId={cub.id}
            xpEntries={xpEntries}
            focusTokenEntries={focusTokenEntries}
            phoneEntries={phoneEntries}
            weekendBankEntries={weekendBankEntries}
          />
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Reward Store</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Redeem Focus Tokens for non-digital or bonus rewards you define.
            </p>
          </div>
          <Link href="/dashboard/rewards" className="text-sm font-medium text-amber-700">
            Manage store →
          </Link>
        </div>
        <div className="mt-4">
          <RewardStoreList
            cubId={cub.id}
            cubName={cub.displayName}
            items={rewardItems}
            availableFocusTokens={summary.totalFocusTokens}
          />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Store redemptions</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Where Focus Token redemptions were applied — phone time today, Weekend
          Bank, or parent-delivered rewards.
        </p>
        <div className="mt-4">
          <CubRedemptionHistory redemptions={redemptions} />
        </div>
      </Card>

    </div>
  );
}
