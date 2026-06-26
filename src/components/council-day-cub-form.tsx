"use client";

import { CubColorBadge } from "@/components/cub-color-dot";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { ActionState } from "@/lib/actions/auth";
import { saveCouncilDayCubEntryAction } from "@/lib/actions/council-day";
import type { CouncilDayPrompt, CubWeekStats } from "@/lib/council-day";
import {
  getCouncilDayDurationLabel,
  isCouncilDayEntryComplete,
} from "@/lib/council-day";
import type { CouncilDayValueRatings } from "@/lib/council-day-values";
import type { AgeBand } from "@/generated/prisma/client";
import { cubAccentClassNames } from "@/lib/cub-colors";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

type CouncilDayCubFormProps = {
  sessionId: string;
  cubId: string;
  displayName: string;
  ageBand: AgeBand;
  prompts: CouncilDayPrompt[];
  weekStats: CubWeekStats;
  initialValues: {
    winNote: string;
    growNote: string;
    familyGoalNote: string;
    reflection: string;
  };
  valueRatings: CouncilDayValueRatings;
  isComplete: boolean;
};

export function CouncilDayCubForm({
  sessionId,
  cubId,
  displayName,
  ageBand,
  prompts,
  weekStats,
  initialValues,
  valueRatings,
  isComplete,
}: CouncilDayCubFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    saveCouncilDayCubEntryAction,
    {} as ActionState,
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  const entryComplete = isCouncilDayEntryComplete(
    { ageBand },
    {
      winNote: initialValues.winNote,
      growNote: initialValues.growNote,
      familyGoalNote: initialValues.familyGoalNote,
      reflection: initialValues.reflection,
      valueRatings,
    },
  );

  return (
    <section
      className={`rounded-lg border border-zinc-200 p-4 dark:border-cub-off-white/10 ${cubAccentClassNames(cubId, { border: true })}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <CubColorBadge cubId={cubId} displayName={displayName} />
          <p className="mt-1 text-xs text-zinc-500">
            {getCouncilDayDurationLabel(ageBand)}
          </p>
        </div>
        {entryComplete ? (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            Notes ready
          </span>
        ) : (
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            In progress
          </span>
        )}
      </div>

      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
        <Stat label="Tasks completed" value={String(weekStats.completedTasks)} />
        <Stat label="Focus logged" value={`${weekStats.focusMinutes} min`} />
        <Stat
          label="Awaiting review"
          value={String(weekStats.submittedAwaitingReview)}
        />
      </dl>

      {isComplete ? (
        <div className="mt-4 space-y-3 text-sm">
          {prompts.map((prompt) => {
            const value = initialValues[prompt.field];
            if (!value) {
              return null;
            }

            return (
              <div key={prompt.id}>
                <p className="font-medium text-zinc-700 dark:text-zinc-300">
                  {prompt.label}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-zinc-600 dark:text-zinc-400">
                  {value}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <form action={formAction} className="mt-4 space-y-4">
          <input type="hidden" name="sessionId" value={sessionId} />
          <input type="hidden" name="cubId" value={cubId} />

          {prompts.map((prompt) => (
            <div key={prompt.id}>
              <Label htmlFor={`${cubId}-${prompt.field}`}>{prompt.label}</Label>
              <p className="mt-1 text-sm text-zinc-500">{prompt.question}</p>
              <textarea
                id={`${cubId}-${prompt.field}`}
                name={prompt.field}
                defaultValue={initialValues[prompt.field]}
                rows={3}
                className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-cub-ebony"
              />
            </div>
          ))}

          {state.error ? (
            <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
          ) : null}
          {state.success ? (
            <p className="text-sm text-green-700 dark:text-green-400">
              {state.success}
            </p>
          ) : null}

          <Button type="submit" variant="secondary" disabled={isPending}>
            {isPending ? "Saving..." : `Save reflection notes for ${displayName}`}
          </Button>
          <p className="text-xs text-zinc-500">
            Save values & expectations above first, then capture each Cub&apos;s
            reflection notes here.
          </p>
        </form>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-zinc-50 px-2 py-1.5 dark:bg-zinc-900">
      <dt className="text-xs text-zinc-500">{label}</dt>
      <dd className="font-medium text-zinc-900 dark:text-zinc-100">{value}</dd>
    </div>
  );
}
