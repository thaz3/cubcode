import Link from "next/link";
import { CubKidHero, CubKidPanel } from "@/components/cub-kid";
import { EmptyState } from "@/components/ui/empty-state";
import { ChallengeProgressBadge } from "@/components/challenge-progress-badge";
import { CubUpcomingRoutinesSection } from "@/components/cub-upcoming-routines-section";
import { auth } from "@/lib/auth";
import { requireCubForUser } from "@/lib/cub-access";
import { formatChallengeInterval } from "@/lib/challenge-intervals";
import { CUB_PAGE_EMOJI, cubKidGameCard } from "@/lib/cub-kid-theme";
import { getCubRoutinesView } from "@/lib/cub-routines";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";

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
    <div className="space-y-5">
      <CubKidHero
        title="Routines"
        subtitle="Repeating habits — your daily power-ups."
        emoji={CUB_PAGE_EMOJI.routines}
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
        <CubKidPanel variant="violet" contentClassName="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cub-gold-light">
            🔄 Due now
          </p>
          <ul className="space-y-2">
            {dueToday.map((routine) => (
              <li key={routine.id}>
                <Link href={`/cub/${cubId}/challenges/${routine.id}`}>
                  <div
                    className={cn(
                      cubKidGameCard,
                      "space-y-2 border-sky-500/30 bg-gradient-to-br from-sky-950/40 to-cub-charcoal p-4",
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-bold text-cub-off-white">{routine.title}</p>
                      {routine.logStatus ? (
                        <ChallengeProgressBadge status={routine.logStatus} />
                      ) : (
                        <span className="text-xs font-bold text-cub-gold-light">Not started</span>
                      )}
                    </div>
                    <p className="text-sm text-cub-muted">
                      {formatChallengeInterval(
                        routine.intervalType,
                        routine.intervalConfig,
                      )}
                      {routine.intervalLabel ? ` · ${routine.intervalLabel}` : ""}
                    </p>
                    <p className="text-xs font-bold uppercase text-sky-300">Check in →</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </CubKidPanel>
      ) : null}

      <CubUpcomingRoutinesSection cubId={cubId} routines={upcoming} />
    </div>
  );
}
