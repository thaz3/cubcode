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
import { formatFocusDeckCategoryPoints } from "@/lib/focus-deck-categories";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const CARD_STATUS_STYLES: Record<TrainingCardBoardStatus, string> = {
  NOT_STARTED: "bg-zinc-800 text-zinc-300",
  ASSIGNED: "bg-sky-950 text-sky-200 ring-1 ring-sky-400/30",
  SUBMITTED: "bg-cub-gold-muted text-cub-gold-light",
  APPROVED: "bg-cub-green-muted text-cub-green-light",
  NEEDS_WORK: "bg-orange-950 text-orange-200",
};

type TrainingDeckCardRowProps = {
  card: {
    id: string;
    title: string;
    description: string | null;
    instructions: string | null;
    categoryPoints: unknown;
    estimatedMinutes: number | null;
  };
  status: TrainingCardBoardStatus;
  taskId: string | null;
  cubId: string;
  deckUnlocked: boolean;
};

export function TrainingDeckCardRow({
  card,
  status,
  taskId,
  cubId,
  deckUnlocked,
}: TrainingDeckCardRowProps) {
  const [state, formAction, pending] = useActionState(
    assignFocusCardAction,
    {} as ActionState,
  );
  const cta = getCardCta(status, taskId);
  const tags = formatFocusDeckCategoryPoints(card.categoryPoints as never);

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-cub-off-white">{card.title}</h3>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                CARD_STATUS_STYLES[status],
              )}
            >
              {TRAINING_CARD_STATUS_LABELS[status]}
            </span>
          </div>
          <p className="text-sm text-cub-muted">
            {card.description ?? card.instructions}
          </p>
          {tags ? (
            <p className="text-xs text-cub-gold/80">{tags}</p>
          ) : null}
          {card.estimatedMinutes ? (
            <p className="text-xs text-zinc-500">~{card.estimatedMinutes} min</p>
          ) : null}
        </div>

        <div className="shrink-0 space-y-2">
          {cta.canAssign && deckUnlocked ? (
            <form action={formAction} className="space-y-2">
              <input type="hidden" name="cardId" value={card.id} />
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
          ) : (
            <Button size="sm" variant="neutral" disabled>
              Locked
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
