"use client";

import { useActionState } from "react";
import Link from "next/link";
import { assignFocusCardAction } from "@/lib/actions/training-board";
import type { ActionState } from "@/lib/actions/auth";
import type { TrainingCardBoardStatus } from "@/lib/training-board-progress";
import {
  TRAINING_CARD_STATUS_LABELS,
  getCardCta,
} from "@/lib/training-board-progress";
import { CubColorBadge } from "@/components/cub-color-dot";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CARD_STATUS_STYLES: Record<TrainingCardBoardStatus, string> = {
  NOT_STARTED: "bg-zinc-800 text-zinc-300",
  ASSIGNED: "bg-sky-950 text-sky-200 ring-1 ring-sky-400/30",
  SUBMITTED: "bg-cub-gold-muted text-cub-gold-light",
  APPROVED: "bg-cub-green-muted text-cub-green-light",
  NEEDS_WORK: "bg-orange-950 text-orange-200",
};

type TrainingDeckCardCubRowProps = {
  cardId: string;
  cubId: string;
  displayName: string;
  status: TrainingCardBoardStatus;
  taskId: string | null;
  deckUnlocked: boolean;
  readOnly?: boolean;
};

export function TrainingDeckCardCubRow({
  cardId,
  cubId,
  displayName,
  status,
  taskId,
  deckUnlocked,
  readOnly = false,
}: TrainingDeckCardCubRowProps) {
  const [state, formAction, pending] = useActionState(
    assignFocusCardAction,
    {} as ActionState,
  );
  const cta = getCardCta(status, taskId);
  const taskHref = taskId ? `/cub/${cubId}/challenges#mission-${taskId}` : null;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        {!readOnly ? (
          <CubColorBadge cubId={cubId} displayName={displayName} />
        ) : null}
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
            CARD_STATUS_STYLES[status],
          )}
        >
          {TRAINING_CARD_STATUS_LABELS[status]}
        </span>
      </div>

      <div className="shrink-0">
        {readOnly ? (
          !deckUnlocked ? (
            <Button size="sm" variant="neutral" disabled>
              Locked
            </Button>
          ) : taskHref ? (
            <Link href={taskHref}>
              <Button size="sm" variant="constructive">
                Go to task
              </Button>
            </Link>
          ) : (
            <Button size="sm" variant="neutral" disabled>
              Ask parent to assign
            </Button>
          )
        ) : cta.canAssign && deckUnlocked ? (
          <form action={formAction} className="space-y-1">
            <input type="hidden" name="cardId" value={cardId} />
            <input type="hidden" name="cubId" value={cubId} />
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Assigning…" : cta.label}
            </Button>
            {state.error ? (
              <p className="text-xs text-cub-red-light">{state.error}</p>
            ) : null}
            {state.success ? (
              <p className="text-xs text-cub-green-light">{state.success}</p>
            ) : null}
          </form>
        ) : cta.href ? (
          <Link href={cta.href}>
            <Button size="sm" variant="secondary">
              {cta.label}
            </Button>
          </Link>
        ) : !deckUnlocked ? (
          <Button size="sm" variant="neutral" disabled>
            Locked
          </Button>
        ) : (
          <Button size="sm" variant="neutral" disabled>
            {TRAINING_CARD_STATUS_LABELS[status]}
          </Button>
        )}
      </div>
    </div>
  );
}
