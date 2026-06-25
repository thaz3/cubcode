import Link from "next/link";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { ChallengeProgressBadge } from "@/components/challenge-progress-badge";
import { CubUpcomingRoutinesSection } from "@/components/cub-upcoming-routines-section";
import { auth } from "@/lib/auth";
import { requireCubForUser } from "@/lib/cub-access";
import { formatChallengeInterval } from "@/lib/challenge-intervals";
import { getCubRoutinesView } from "@/lib/cub-routines";
import { redirect } from "next/navigation";

type CubRoutinesPageProps = {
  params: Promise<{ cubId: string }>;
};

export default async function CubRoutinesPage({ params }: CubRoutinesPageProps) {
  const { cubId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { cub, familyId } = await requireCubForUser(cubId, session.user.id);
  const { dueToday, upcoming } = await getCubRoutinesView(familyId, cub.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Routines"
        subtitle="Repeating habits — not one-time tasks."
        backHref={`/cub/${cubId}`}
        backLabel="Today"
      />

      {dueToday.length === 0 && upcoming.length === 0 ? (
        <EmptyState
          title="No routines yet"
          description="When your parent sets up a repeating routine, it will show here."
        />
      ) : null}

      {dueToday.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-100">Due now</h2>
          <ul className="space-y-2">
            {dueToday.map((routine) => (
              <li key={routine.id}>
                <Link href={`/cub/${cubId}/challenges/${routine.id}`}>
                  <Card variant="interactive" className="space-y-2 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-zinc-100">{routine.title}</p>
                      {routine.logStatus ? (
                        <ChallengeProgressBadge status={routine.logStatus} />
                      ) : (
                        <span className="text-xs text-zinc-500">Not started</span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-500">
                      {formatChallengeInterval(
                        routine.intervalType,
                        routine.intervalConfig,
                      )}
                      {routine.intervalLabel ? ` · ${routine.intervalLabel}` : ""}
                    </p>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <CubUpcomingRoutinesSection cubId={cubId} routines={upcoming} />
    </div>
  );
}
