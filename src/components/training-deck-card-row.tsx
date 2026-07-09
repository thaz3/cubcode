import { TrainingDeckCardCubRow } from "@/components/training-deck-card-cub-row";
import type { TrainingCardBoardStatus } from "@/lib/training-board-progress";
import { formatFocusDeckCategoryPoints } from "@/lib/focus-deck-categories";
import { Card } from "@/components/ui/card";

export type TrainingDeckCardCubState = {
  cubId: string;
  displayName: string;
  status: TrainingCardBoardStatus;
  taskId: string | null;
  deckUnlocked: boolean;
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
  cubStates: TrainingDeckCardCubState[];
  readOnly?: boolean;
  codeRewardsLabel?: string | null;
  estimatedMinutesLabel?: string | null;
  metaRewardsLabel?: string | null;
  partItems?: string[] | null;
};

export function TrainingDeckCardRow({
  card,
  cubStates,
  readOnly = false,
  codeRewardsLabel = null,
  estimatedMinutesLabel = null,
  metaRewardsLabel = null,
  partItems = null,
}: TrainingDeckCardRowProps) {
  const tags =
    codeRewardsLabel ?? formatFocusDeckCategoryPoints(card.categoryPoints as never);
  const timeLabel =
    estimatedMinutesLabel ??
    (card.estimatedMinutes ? `~${card.estimatedMinutes} min` : null);

  return (
    <Card className="p-4">
      <div className="space-y-2">
        <h3 className="font-semibold text-cub-off-white">{card.title}</h3>
        <p className="text-sm text-cub-muted">
          {card.description ?? card.instructions}
        </p>
        {partItems && partItems.length > 0 ? (
          <ul className="mt-2 space-y-1.5 rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2.5">
            {partItems.map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs text-zinc-300">
                <span className="mt-0.5 shrink-0 text-cub-gold-light" aria-hidden>
                  ◇
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {tags ? <p className="text-xs font-medium text-cub-gold-light">{tags}</p> : null}
        {metaRewardsLabel ? (
          <p className="text-xs font-semibold text-sky-300">{metaRewardsLabel}</p>
        ) : null}
        {timeLabel ? <p className="text-xs text-zinc-500">{timeLabel}</p> : null}
      </div>

      {cubStates.length > 0 ? (
        <ul className="mt-4 space-y-2 border-t border-zinc-800 pt-4">
          {cubStates.map((cub) => (
            <li key={cub.cubId}>
              <TrainingDeckCardCubRow
                cardId={card.id}
                cubId={cub.cubId}
                displayName={cub.displayName}
                status={cub.status}
                taskId={cub.taskId}
                deckUnlocked={cub.deckUnlocked}
                readOnly={readOnly}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}
