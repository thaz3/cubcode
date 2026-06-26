import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { TrainingDeckCardRow } from "@/components/training-deck-card-row";
import { CubColorBadge } from "@/components/cub-color-dot";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { TaskStatus } from "@/generated/prisma/client";
import {
  buildLatestTasksByCardId,
  countApprovedCardsForDeck,
  getTrainingCardStatusFromTask,
  getTrainingDeckBoardStatus,
  isTrainingDeckComplete,
  TRAINING_DECK_STATUS_LABELS,
} from "@/lib/training-board-progress";
import {
  ensureTrainingBoardSeeded,
  getTrainingDecksForFamily,
} from "@/lib/training-deck-seed";
import { getFamilyForUser } from "@/lib/session";
import { cn } from "@/lib/utils";

type TrainingDeckDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ cubId?: string }>;
};

export default async function TrainingDeckDetailPage({
  params,
  searchParams,
}: TrainingDeckDetailPageProps) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const family = await getFamilyForUser(session.user.id);
  if (!family) redirect("/signup");

  await ensureTrainingBoardSeeded(family.id);

  const query = await searchParams;
  const cub =
    family.cubs.find((c) => c.id === query.cubId) ?? family.cubs[0] ?? null;

  const decks = await getTrainingDecksForFamily(family.id);
  const deck = decks.find((d) => d.slug === slug);
  if (!deck) notFound();

  let tasksByCardId = new Map<
    string,
    { id: string; status: TaskStatus }
  >();
  let deckStatus = getTrainingDeckBoardStatus(deck, decks, tasksByCardId);
  let approvedCount = 0;
  const deckUnlocked = deckStatus !== "LOCKED";

  if (cub) {
    const cubTasks = await db.task.findMany({
      where: {
        familyId: family.id,
        cubId: cub.id,
        trainingDeckId: deck.id,
      },
      select: {
        id: true,
        status: true,
        focusActivityCardId: true,
        updatedAt: true,
      },
    });
    tasksByCardId = buildLatestTasksByCardId(cubTasks);
    deckStatus = getTrainingDeckBoardStatus(deck, decks, tasksByCardId);
    approvedCount = countApprovedCardsForDeck(deck, tasksByCardId);
  }

  const progressPct =
    deck.cards.length > 0 ? Math.round((approvedCount / deck.cards.length) * 100) : 0;
  const deckComplete = isTrainingDeckComplete(deck, tasksByCardId);

  return (
    <div className="space-y-6">
      <PageHeader
        title={deck.title}
        subtitle={deck.description ?? undefined}
        backHref={`/dashboard/tasks/templates${cub ? `?cubId=${cub.id}` : ""}`}
        backLabel="Training Board"
      />

      <Card
        className={cn(
          "space-y-4 border p-5",
          deckStatus === "COMPLETE"
            ? "border-cub-green-bright/40 cub-card-green"
            : deckStatus === "IN_PROGRESS"
              ? "border-sky-400/40 bg-sky-950/20"
              : deckStatus === "LOCKED"
                ? "border-zinc-700 bg-zinc-900/40"
                : "border-cub-gold/40 cub-card-gold",
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-cub-gold-light">
              Milestone {deck.milestoneNumber}
            </p>
            <p className="mt-1 text-sm text-cub-muted">
              Status: {TRAINING_DECK_STATUS_LABELS[deckStatus]}
            </p>
            {cub ? (
              <p className="mt-2 text-sm text-cub-muted">
                Path for{" "}
                <CubColorBadge cubId={cub.id} displayName={cub.displayName} />
              </p>
            ) : null}
          </div>
          <p className="text-sm font-medium text-cub-gold">
            {approvedCount}/{deck.cards.length} cards complete
          </p>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              deckComplete ? "bg-cub-green-bright" : "bg-cub-gold",
            )}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </Card>

      {family.cubs.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {family.cubs.map((familyCub) => (
            <Link
              key={familyCub.id}
              href={`/dashboard/tasks/templates/deck/${slug}?cubId=${familyCub.id}`}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition",
                cub?.id === familyCub.id
                  ? "border-cub-gold/50 bg-cub-gold-muted text-cub-gold-light"
                  : "border-zinc-700 text-zinc-400 hover:border-cub-gold/30",
              )}
            >
              <CubColorBadge
                cubId={familyCub.id}
                displayName={familyCub.displayName}
              />
            </Link>
          ))}
        </div>
      ) : null}

      {deckStatus === "LOCKED" ? (
        <Card className="border-zinc-700 bg-zinc-900/50 p-4">
          <p className="text-sm text-cub-muted">
            Complete the previous milestone deck to unlock these cards.
          </p>
          <Link
            href={`/dashboard/tasks/templates${cub ? `?cubId=${cub.id}` : ""}`}
            className="mt-3 inline-block"
          >
            <Button variant="secondary" size="sm">
              Back to Training Board
            </Button>
          </Link>
        </Card>
      ) : (
        <ul className="space-y-3">
          {deck.cards.map((card) => {
            const task = tasksByCardId.get(card.id) ?? null;
            const cardStatus = getTrainingCardStatusFromTask(task);

            return (
              <li key={card.id}>
                <TrainingDeckCardRow
                  card={card}
                  status={cardStatus}
                  taskId={task?.id ?? null}
                  cubId={cub?.id ?? ""}
                  deckUnlocked={deckUnlocked}
                />
              </li>
            );
          })}
        </ul>
      )}

      {deckComplete ? (
        <Card className="border-cub-green-bright/40 cub-card-green p-5">
          <h2 className="text-lg font-semibold text-cub-off-white">
            Deck complete!
          </h2>
          <p className="mt-1 text-sm text-cub-muted">
            Every card in {deck.title} has been approved. The next milestone is
            unlocked on the Training Board.
          </p>
          <Link
            href={`/dashboard/tasks/templates${cub ? `?cubId=${cub.id}` : ""}`}
            className="mt-4 inline-block"
          >
            <Button size="sm">Back to Training Board</Button>
          </Link>
        </Card>
      ) : null}
    </div>
  );
}
