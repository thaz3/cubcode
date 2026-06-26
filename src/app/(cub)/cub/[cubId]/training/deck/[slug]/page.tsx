import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { TrainingDeckCardRow } from "@/components/training-deck-card-row";
import { TrainingDeckMilestoneProgress } from "@/components/training-deck-milestone-progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { auth } from "@/lib/auth";
import { requireCubForUser } from "@/lib/cub-access";
import { db } from "@/lib/db";
import {
  buildLatestTasksByCardId,
  countApprovedCardsForDeck,
  getTrainingCardStatusFromTask,
  getTrainingDeckBoardStatus,
} from "@/lib/training-board-progress";
import {
  ensureTrainingBoardSeeded,
  getTrainingDecksForFamily,
} from "@/lib/training-deck-seed";

type CubTrainingDeckDetailPageProps = {
  params: Promise<{ cubId: string; slug: string }>;
};

export default async function CubTrainingDeckDetailPage({
  params,
}: CubTrainingDeckDetailPageProps) {
  const { cubId, slug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { cub, familyId } = await requireCubForUser(cubId, session.user.id);

  await ensureTrainingBoardSeeded(familyId);

  const decks = await getTrainingDecksForFamily(familyId);
  const deck = decks.find((d) => d.slug === slug);
  if (!deck) notFound();

  const cubTasks = await db.task.findMany({
    where: {
      familyId,
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

  const tasksByCardId = buildLatestTasksByCardId(cubTasks);
  const deckStatus = getTrainingDeckBoardStatus(deck, decks, tasksByCardId);
  const approvedCount = countApprovedCardsForDeck(deck, tasksByCardId);
  const deckUnlocked = deckStatus !== "LOCKED";
  const deckComplete = deckStatus === "COMPLETE";

  const cubProgress = [
    {
      cubId: cub.id,
      displayName: cub.displayName,
      status: deckStatus,
      approvedCount,
      totalCards: deck.cards.length,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={deck.title}
        subtitle={deck.description ?? undefined}
        backHref={`/cub/${cub.id}/training`}
        backLabel="Training Board"
      />

      <TrainingDeckMilestoneProgress
        milestoneNumber={deck.milestoneNumber}
        cubProgress={cubProgress}
        subtitle="Your progress on this deck"
      />

      {!deckUnlocked ? (
        <Card className="border-zinc-700 bg-zinc-900/50 p-4">
          <p className="text-sm text-cub-muted">
            Finish the previous milestone first. Your parent can assign cards
            once this deck unlocks.
          </p>
          <Link href={`/cub/${cub.id}/training`} className="mt-3 inline-block">
            <Button variant="secondary" size="sm">
              Back to Training Board
            </Button>
          </Link>
        </Card>
      ) : (
        <>
          <Card className="p-4">
            <p className="text-sm text-cub-muted">
              Cards are assigned by your parent. When one is ready, open it from{" "}
              <Link
                href={`/cub/${cub.id}/tasks`}
                className="font-medium text-cub-gold-light hover:underline"
              >
                My tasks
              </Link>
              .
            </p>
          </Card>

          <ul className="space-y-3">
            {deck.cards.map((card) => {
              const task = tasksByCardId.get(card.id) ?? null;

              return (
                <li key={card.id}>
                  <TrainingDeckCardRow
                    card={card}
                    readOnly
                    cubStates={[
                      {
                        cubId: cub.id,
                        displayName: cub.displayName,
                        status: getTrainingCardStatusFromTask(task),
                        taskId: task?.id ?? null,
                        deckUnlocked,
                      },
                    ]}
                  />
                </li>
              );
            })}
          </ul>
        </>
      )}

      {deckComplete ? (
        <Card className="border-cub-green-bright/40 cub-card-green p-5">
          <h2 className="text-lg font-semibold text-cub-off-white">
            You finished this deck!
          </h2>
          <p className="mt-1 text-sm text-cub-muted">
            Nice work on {deck.title}. The next milestone is unlocked on your
            Training Board.
          </p>
          <Link href={`/cub/${cub.id}/training`} className="mt-4 inline-block">
            <Button size="sm">Back to Training Board</Button>
          </Link>
        </Card>
      ) : null}
    </div>
  );
}
