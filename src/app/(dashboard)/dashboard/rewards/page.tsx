import { CreateRewardStoreItemForm } from "@/components/create-reward-store-item-form";
import { RewardStoreRedeemPanel } from "@/components/reward-store-redeem-panel";
import { Card } from "@/components/ui/card";
import { seedRewardStoreForFamily } from "@/lib/actions/rewards";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getFamilyForUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function RewardsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const family = await getFamilyForUser(session.user.id);
  if (!family) redirect("/signup");

  await seedRewardStoreForFamily(family.id);

  const [items, tokenBalances] = await Promise.all([
    db.rewardStoreItem.findMany({
      where: { familyId: family.id },
      orderBy: [{ isActive: "desc" }, { costFocusTokens: "asc" }],
    }),
    Promise.all(
      family.cubs.map(async (cub) => {
        const balance = await db.focusTokenLedgerEntry.aggregate({
          where: { cubId: cub.id },
          _sum: { amount: true },
        });
        return {
          id: cub.id,
          displayName: cub.displayName,
          focusTokens: balance._sum.amount ?? 0,
        };
      }),
    ),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Reward Store</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Select a reward, choose which Cub redeems it, and confirm. You deliver
          each reward in real life.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">Add a reward</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Examples: pick dinner, extra screen time, stay up later on weekend.
          </p>
          <div className="mt-4">
            <CreateRewardStoreItemForm />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Redeem a reward</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Click a store item to select it, then pick the Cub and redeem.
          </p>
          <div className="mt-4">
            <RewardStoreRedeemPanel items={items} cubs={tokenBalances} />
          </div>
        </Card>
      </div>
    </div>
  );
}
