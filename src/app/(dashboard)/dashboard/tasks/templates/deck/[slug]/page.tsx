import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { TrainingDeckCardRow } from "@/components/training-deck-card-row";
import { TrainingDeckMilestoneProgress } from "@/components/training-deck-milestone-progress";
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
} from "@/lib/training-board-progress";
import {
  ensureTrainingBoardSeeded,
  getTrainingDecksForFamily,
} from "@/lib/training-deck-seed";
import { getFamilyForUser } from "@/lib/session";

type TrainingDeckDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function TrainingDeckDetailPage({
  params,
}: TrainingDeckDetailPageProps) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const family = await getFamilyForUser(session.user.id);
  if (!family) redirect("/signup");

  await ensureTrainingBoardSeeded(family.id);

  const decks = await getTrainingDecksForFamily(family.id);
  const deck = decks.find((d) => d.slug === slug);
  if (!deck) notFound();

  const cubIds = family.cubs.map((c) => c.id);
  const allTasks =
    cubIds.length > 0
      ? await db.task.findMany({
          where: {
            familyId: family.id,
            cubId: { in: cubIds },
            trainingDeckId: deck.id,
          },
          select: {
            id: true,
            cubId: true,
            status: true,
            focusActivityCardId: true,
            updatedAt: true,
          },
        })
      : [];

  const tasksByCubId = new Map<
    string,
    Map<string, { id: string; status: TaskStatus }>
  >();

  for (const cub of family.cubs) {
    const cubTasks = allTasks.filter((task) => task.cubId === cub.id);
    tasksByCubId.set(cub.id, buildLatestTasksByCardId(cubTasks));
  }

  const cubProgress = family.cubs.map((cub) => {
    const tasksByCardId = tasksByCubId.get(cub.id) ?? new Map();
    return {
      cubId: cub.id,
      displayName: cub.displayName,
      status: getTrainingDeckBoardStatus(deck, decks, tasksByCardId),
      approvedCount: countApprovedCardsForDeck(deck, tasksByCardId),
      totalCards: deck.cards.length,
    };
  });

  const anyCubUnlocked = cubProgress.some((c) => c.status !== "LOCKED");
  const allCubsComplete =
    cubProgress.length > 0 && cubProgress.every((c) => c.status === "COMPLETE");

  return (
    <div className="space-y-6">
      <PageHeader
        title={deck.title}
        subtitle={deck.description ?? undefined}
        backHref="/dashboard/tasks/templates"
        backLabel="Training Board"
      />

      {cubProgress.length > 0 ? (
        <TrainingDeckMilestoneProgress
          milestoneNumber={deck.milestoneNumber}
          cubProgress={cubProgress}
        />
      ) : (
        <Card className="border p-5">
          <p className="text-sm text-cub-muted">
            Add a Cub profile to start this training deck.
          </p>
        </Card>
      )}

      {!anyCubUnlocked ? (
        <Card className="border-amber-900/40 bg-amber-950/20 p-4">
          <p className="text-sm text-cub-muted">
            This milestone is still locked for every Cub until the previous deck
            is complete. You can preview cards below — assign when a Cub unlocks
            this step.
          </p>
        </Card>
      ) : null}

      <ul className="space-y-3">
        {deck.cards.map((card) => {
          const cubStates = family.cubs.map((cub) => {
            const tasksByCardId = tasksByCubId.get(cub.id) ?? new Map();
            const task = tasksByCardId.get(card.id) ?? null;
            const deckStatus = getTrainingDeckBoardStatus(
              deck,
              decks,
              tasksByCardId,
            );

            return {
              cubId: cub.id,
              displayName: cub.displayName,
              status: getTrainingCardStatusFromTask(task),
              taskId: task?.id ?? null,
              deckUnlocked: deckStatus !== "LOCKED",
            };
          });

          return (
            <li key={card.id}>
              <TrainingDeckCardRow card={card} cubStates={cubStates} />
            </li>
          );
        })}
      </ul>

      {allCubsComplete ? (
        <Card className="border-cub-green-bright/40 cub-card-green p-5">
          <h2 className="text-lg font-semibold text-cub-off-white">
            Deck complete for everyone!
          </h2>
          <p className="mt-1 text-sm text-cub-muted">
            Every Cub has finished {deck.title}. The next milestone is unlocked
            on the Training Board.
          </p>
          <Link href="/dashboard/tasks/templates" className="mt-4 inline-block">
            <Button size="sm">Back to Training Board</Button>
          </Link>
        </Card>
      ) : cubProgress.some((c) => c.status === "COMPLETE") ? (
        <Card className="border-cub-green-bright/30 bg-cub-green-muted/20 p-4">
          <p className="text-sm text-cub-muted">
            {cubProgress
              .filter((c) => c.status === "COMPLETE")
              .map((c) => c.displayName)
              .join(" and ")}{" "}
            finished this deck. Others can keep going on their cards above.
          </p>
        </Card>
      ) : null}
    </div>
  );
}
