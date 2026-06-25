import Link from "next/link";
import { Card } from "@/components/ui/card";
import { formatChallengeInterval } from "@/lib/challenge-intervals";
import type { CubUpcomingRoutine } from "@/lib/cub-routines";

type CubUpcomingRoutinesSectionProps = {
  cubId: string;
  routines: CubUpcomingRoutine[];
};

export function CubUpcomingRoutinesSection({
  cubId,
  routines,
}: CubUpcomingRoutinesSectionProps) {
  if (routines.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100">Upcoming routines</h2>
        <p className="text-sm text-zinc-500">
          Not due today — your parent set these up to repeat on other days.
        </p>
      </div>
      <ul className="space-y-2">
        {routines.map((routine) => (
          <li key={routine.id}>
            <Card className="py-4">
              <p className="font-medium text-zinc-300">{routine.title}</p>
              <p className="mt-1 text-sm text-zinc-500">
                {formatChallengeInterval(
                  routine.intervalType,
                  routine.intervalConfig,
                )}
              </p>
            </Card>
          </li>
        ))}
      </ul>
      <Link
        href={`/cub/${cubId}/challenges`}
        className="inline-block text-sm font-medium text-cub-gold hover:text-cub-gold-light"
      >
        All routines →
      </Link>
    </section>
  );
}
