"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CubLink } from "@/components/cub-link";
import type { ActionState } from "@/lib/actions/auth";
import { approveFocusCompletionAction } from "@/lib/actions/focus-deck";
import { cubErrorText, cubLink, cubSuccessText } from "@/lib/cub-theme";
import { formatFocusDeckCategoryPoints, parseFocusDeckCategoryPoints } from "@/lib/focus-deck-categories";

type FocusDeckReviewCardProps = {
  completion: {
    id: string;
    reflection: string | null;
    submittedAt: Date | null;
    card: {
      title: string;
      categoryPoints: unknown;
    };
    cub: { id: string; displayName: string };
  };
};

export function FocusDeckReviewCard({ completion }: FocusDeckReviewCardProps) {
  const [state, approveAction, pending] = useActionState(
    approveFocusCompletionAction,
    {} as ActionState,
  );

  const points = parseFocusDeckCategoryPoints(completion.card.categoryPoints);
  const pointsLabel = points ? formatFocusDeckCategoryPoints(points) : null;

  const reflectionSnippet = completion.reflection
    ? completion.reflection.length > 120
      ? `${completion.reflection.slice(0, 120)}…`
      : completion.reflection
    : null;

  return (
    <Card variant="constructive" className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-cub-green-muted px-2 py-0.5 text-xs font-semibold text-cub-green-light ring-1 ring-cub-green-bright/35">
            Focus card
          </span>
          <h2 className="text-lg font-semibold text-cub-off-white">
            {completion.card.title}
          </h2>
        </div>
        <p className="text-sm text-zinc-400">
          <CubLink
            cubId={completion.cub.id}
            displayName={completion.cub.displayName}
            className={`font-medium ${cubLink}`}
          />
          {pointsLabel ? ` · ${pointsLabel}` : null}
        </p>
        {reflectionSnippet ? (
          <p className="rounded-xl bg-cub-ebony/60 px-3 py-2 text-sm text-zinc-300">
            {reflectionSnippet}
          </p>
        ) : null}
        {completion.submittedAt ? (
          <p className="text-xs text-zinc-500">
            Submitted {completion.submittedAt.toLocaleString()}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <form action={approveAction} className="flex-1">
          <input type="hidden" name="completionId" value={completion.id} />
          <Button type="submit" variant="constructive" fullWidth size="lg" disabled={pending}>
            {pending ? "Approving…" : "Approve"}
          </Button>
        </form>
        <Link
          href={`/dashboard/focus-deck/review/${completion.id}`}
          className="flex-1"
        >
          <Button variant="neutral" fullWidth size="lg">
            Full review
          </Button>
        </Link>
      </div>

      {state.success ? (
        <p className={`text-sm ${cubSuccessText}`}>{state.success}</p>
      ) : state.error ? (
        <p className={`text-sm ${cubErrorText}`}>{state.error}</p>
      ) : null}
    </Card>
  );
}
