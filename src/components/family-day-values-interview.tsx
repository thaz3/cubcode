"use client";

import { CubColorBadge } from "@/components/cub-color-dot";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { ActionState } from "@/lib/actions/auth";
import { saveFamilyDayValueRatingsAction } from "@/lib/actions/council-day";
import {
  COUNCIL_DAY_RATING_LABELS,
  COUNCIL_DAY_VALUE_DIMENSIONS,
  ratingsDiffer,
  type CouncilDayValueRatings,
} from "@/lib/council-day-values";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

type FamilyDayCubRatings = {
  id: string;
  displayName: string;
  valueRatings: CouncilDayValueRatings;
};

type FamilyDayValuesInterviewProps = {
  sessionId: string;
  cubs: FamilyDayCubRatings[];
  readOnly?: boolean;
};

export function FamilyDayValuesInterview({
  sessionId,
  cubs,
  readOnly = false,
}: FamilyDayValuesInterviewProps) {
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);
  const [state, formAction, isPending] = useActionState(
    saveFamilyDayValueRatingsAction,
    {} as ActionState,
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  const content = (
    <div className="space-y-6">
      {COUNCIL_DAY_VALUE_DIMENSIONS.map((dimension) => (
        <section
          key={dimension.id}
          className="rounded-lg border border-violet-100 bg-white/60 p-4 dark:border-violet-900/60 dark:bg-cub-ebony/40"
        >
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            {dimension.label}
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            Parent: {dimension.parentPrompt} · Cub: {dimension.cubPrompt}
          </p>

          <div className="mt-4 space-y-3">
            {cubs.map((cub) => {
              const rating = cub.valueRatings[dimension.id];
              const showCommentHint = ratingsDiffer(rating);

              if (readOnly) {
                if (!rating) {
                  return null;
                }

                return (
                  <div
                    key={cub.id}
                    className="rounded-lg border border-zinc-200 px-3 py-3 dark:border-cub-off-white/10"
                  >
                    <CubColorBadge cubId={cub.id} displayName={cub.displayName} />
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                      Parent: {rating.parent}/5 · Cub: {rating.cub}/5
                    </p>
                    {rating.comment ? (
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                        <span className="font-medium">Note: </span>
                        {rating.comment}
                      </p>
                    ) : null}
                  </div>
                );
              }

              return (
                <div
                  key={cub.id}
                  className="rounded-lg border border-zinc-200 bg-zinc-50/80 p-3 dark:border-cub-off-white/10 dark:bg-cub-charcoal/40"
                >
                  <CubColorBadge cubId={cub.id} displayName={cub.displayName} />
                  <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.4fr)] lg:items-start">
                    <RatingRow
                      dimensionId={dimension.id}
                      cubId={cub.id}
                      side="parent"
                      label="Parent"
                      prompt={dimension.parentPrompt}
                      defaultValue={rating?.parent ?? 0}
                      hovered={hovered}
                      setHovered={setHovered}
                    />
                    <RatingRow
                      dimensionId={dimension.id}
                      cubId={cub.id}
                      side="cub"
                      label="Cub"
                      prompt={dimension.cubPrompt}
                      defaultValue={rating?.cub ?? 0}
                      hovered={hovered}
                      setHovered={setHovered}
                    />
                    <div>
                      <Label htmlFor={`${cub.id}-comment-${dimension.id}`}>
                        Comment
                        {showCommentHint ? (
                          <span className="ml-1 font-normal text-amber-700 dark:text-cub-gold-light">
                            (helpful when ratings differ)
                          </span>
                        ) : null}
                      </Label>
                      <textarea
                        id={`${cub.id}-comment-${dimension.id}`}
                        name={`rating_comment_${dimension.id}_${cub.id}`}
                        defaultValue={rating?.comment ?? ""}
                        rows={2}
                        placeholder="Optional unless parent and Cub ratings differ"
                        className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-cub-ebony"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );

  if (readOnly) {
    return (
      <CardShell>
        <Header />
        {content}
      </CardShell>
    );
  }

  return (
    <CardShell>
      <Header />
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="sessionId" value={sessionId} />
        {content}
        {state.error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
        ) : null}
        {state.success ? (
          <p className="text-sm text-green-700 dark:text-green-400">
            {state.success}
          </p>
        ) : null}
        <Button type="submit" variant="secondary" disabled={isPending}>
          {isPending ? "Saving..." : "Save values & expectations"}
        </Button>
        <p className="text-xs text-zinc-500">
          Work through each category with every Cub at the table — parent and Cub
          scores side by side, then save once.
        </p>
      </form>
    </CardShell>
  );
}

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-lg border border-violet-200 bg-violet-50/50 p-4 dark:border-violet-900 dark:bg-violet-950/20">
      {children}
    </section>
  );
}

function Header() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-violet-950 dark:text-violet-100">
        Values & expectations
      </h2>
      <p className="mt-1 text-sm text-violet-900/80 dark:text-violet-200/80">
        Go category by category and interview each Cub together. Rate 1–5 side
        by side; add a short comment when you see it differently.
      </p>
    </div>
  );
}

function RatingRow({
  dimensionId,
  cubId,
  side,
  label,
  prompt,
  defaultValue,
  hovered,
  setHovered,
}: {
  dimensionId: string;
  cubId: string;
  side: "parent" | "cub";
  label: string;
  prompt: string;
  defaultValue: number;
  hovered: string | null;
  setHovered: (value: string | null) => void;
}) {
  const fieldName = `rating_${side}_${dimensionId}_${cubId}`;
  const hoverKey = `${cubId}-${dimensionId}-${side}`;

  return (
    <fieldset>
      <legend className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {label}
      </legend>
      <p className="text-xs text-zinc-500">{prompt}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {[1, 2, 3, 4, 5].map((score) => (
          <label
            key={score}
            className="cursor-pointer"
            onMouseEnter={() => setHovered(`${hoverKey}-${score}`)}
            onMouseLeave={() => setHovered(null)}
          >
            <input
              type="radio"
              name={fieldName}
              value={score}
              defaultChecked={defaultValue === score}
              className="peer sr-only"
            />
            <span
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition",
                "border-zinc-300 bg-white text-zinc-700",
                "peer-checked:border-violet-600 peer-checked:bg-violet-600 peer-checked:text-white",
                "hover:border-violet-400 hover:bg-violet-50",
                "dark:border-zinc-700 dark:bg-cub-ebony dark:text-zinc-200",
                "dark:peer-checked:border-violet-500 dark:peer-checked:bg-violet-500",
                hovered === `${hoverKey}-${score}` &&
                  "border-violet-400 bg-violet-50 dark:bg-violet-950/40",
              )}
            >
              {score}
            </span>
          </label>
        ))}
        <span className="ml-1 self-center text-xs text-zinc-500">
          {defaultValue > 0
            ? COUNCIL_DAY_RATING_LABELS[defaultValue]
            : "Select 1–5"}
        </span>
      </div>
    </fieldset>
  );
}
