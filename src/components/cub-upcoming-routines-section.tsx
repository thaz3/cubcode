import Link from "next/link";
import { CubKidPanel } from "@/components/cub-kid/cub-kid-panel";
import { formatChallengeInterval } from "@/lib/challenge-intervals";
import { cubKidGameCard } from "@/lib/cub-kid-theme";
import type { CubUpcomingRoutine } from "@/lib/cub-routines";
import { cn } from "@/lib/utils";

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
    <CubKidPanel variant="gold" contentClassName="space-y-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cub-gold-light">
          📅 Coming up
        </p>
        <p className="mt-1 text-sm text-cub-muted">
          Not due today — your parent set these up to repeat on other days.
        </p>
      </div>
      <ul className="space-y-2">
        {routines.map((routine) => (
          <li key={routine.id}>
            <div
              className={cn(
                cubKidGameCard,
                "border-cub-gold/20 bg-gradient-to-br from-cub-charcoal to-cub-ebony p-4",
              )}
            >
              <p className="font-bold text-cub-off-white">{routine.title}</p>
              <p className="mt-1 text-sm text-cub-muted">
                {formatChallengeInterval(
                  routine.intervalType,
                  routine.intervalConfig,
                )}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <Link
        href={`/cub/${cubId}/challenges`}
        className="inline-block text-sm font-bold text-cub-gold-light hover:text-cub-gold-warm"
      >
        All routines →
      </Link>
    </CubKidPanel>
  );
}
