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
};

export function TrainingDeckCardRow({
  card,
  cubStates,
  readOnly = false,
}: TrainingDeckCardRowProps) {
  const tags = formatFocusDeckCategoryPoints(card.categoryPoints as never);

  return (
    <Card className="p-4">
      <div className="space-y-2">
        <h3 className="font-semibold text-cub-off-white">{card.title}</h3>
        <p className="text-sm text-cub-muted">
          {card.description ?? card.instructions}
        </p>
        {tags ? <p className="text-xs text-cub-gold/80">{tags}</p> : null}
        {card.estimatedMinutes ? (
          <p className="text-xs text-zinc-500">~{card.estimatedMinutes} min</p>
        ) : null}
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
