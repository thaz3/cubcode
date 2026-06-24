import Link from "next/link";
import { CubCard } from "@/components/cub-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCubRewardSummary } from "@/lib/rewards";
import { getFamilyForUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function CubsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const family = await getFamilyForUser(session.user.id);
  if (!family) {
    redirect("/signup");
  }

  const cubData = await Promise.all(
    family.cubs.map(async (cub) => {
      const [summary, activeCount, assignedCount] = await Promise.all([
        getCubRewardSummary(cub),
        db.task.count({
          where: {
            familyId: family.id,
            cubId: cub.id,
            status: { in: ["CLAIMED", "IN_PROGRESS", "SENT_BACK"] },
          },
        }),
        db.task.count({
          where: { familyId: family.id, cubId: cub.id },
        }),
      ]);
      return { cub, summary, activeCount, assignedCount };
    }),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cubs"
        subtitle="Family roster and progress. Parent-managed profiles — no separate Cub logins."
        action={
          <Link href="/dashboard/cubs/new">
            <Button size="lg">Add Cub</Button>
          </Link>
        }
      />

      {family.cubs.length === 0 ? (
        <EmptyState
          title="No Cubs yet"
          description="Add your first Cub to choose an age band and start assigning tasks."
          actionLabel="Add Cub"
          actionHref="/dashboard/cubs/new"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {cubData.map(({ cub, summary, activeCount, assignedCount }) => (
            <CubCard
              key={cub.id}
              cub={cub}
              assignedCount={assignedCount}
              activeCount={activeCount}
              rewards={summary}
            />
          ))}
        </div>
      )}
    </div>
  );
}
