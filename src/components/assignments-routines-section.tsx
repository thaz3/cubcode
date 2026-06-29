"use client";

import Link from "next/link";
import { AssignmentRoutineCard } from "@/components/assignment-routine-card";
import {
  CollapsibleSection,
  useOpenOnHash,
} from "@/components/ui/collapsible-section";
import type { AssignmentRoutine } from "@/lib/assignment-routine-groups";
import { groupAssignmentRoutines } from "@/lib/assignment-routine-groups";

type AssignmentsRoutinesSectionProps = {
  routines: AssignmentRoutine[];
};

export function AssignmentsRoutinesSection({
  routines,
}: AssignmentsRoutinesSectionProps) {
  const groupedRoutines = groupAssignmentRoutines(routines);
  const [open, setOpen] = useOpenOnHash(
    "routines",
    groupedRoutines.length > 0,
  );

  return (
    <section id="routines" className="scroll-mt-36">
      <CollapsibleSection
        title="Routines"
        summary="Repeating habits — stay here until you archive them"
        badge={groupedRoutines.length}
        defaultOpen={groupedRoutines.length > 0}
        open={open}
        onOpenChange={setOpen}
      >
        {groupedRoutines.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No routines yet.{" "}
            <Link
              href="/dashboard/tasks/assign?kind=routine"
              className="font-medium text-cub-gold hover:text-cub-gold-light"
            >
              Create a routine
            </Link>
            .
          </p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {groupedRoutines.map((routine) => (
              <li key={routine.key}>
                <AssignmentRoutineCard routine={routine} />
              </li>
            ))}
          </ul>
        )}
      </CollapsibleSection>
    </section>
  );
}
