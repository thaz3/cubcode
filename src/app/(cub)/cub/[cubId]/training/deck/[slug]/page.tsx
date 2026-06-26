import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { TrainingDeckCardRow } from "@/components/training-deck-card-row";
import { TrainingDeckMilestoneProgress } from "@/components/training-deck-milestone-progress";
import { CubKidHero, CubKidPanel, CubKidTipCard } from "@/components/cub-kid";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { requireCubForUser } from "@/lib/cub-access";
import { CUB_PAGE_EMOJI } from "@/lib/cub-kid-theme";
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
    <div className="space-y-5">
      <CubKidHero
        title={deck.title}
        subtitle={deck.description ?? `Level ${deck.milestoneNumber} on your Training Path`}
        emoji={CUB_PAGE_EMOJI.level}
        backHref={`/cub/${cub.id}/training`}
        backLabel="Training Path"
      />

      <TrainingDeckMilestoneProgress
        milestoneNumber={deck.milestoneNumber}
        cubProgress={cubProgress}
        subtitle="Your progress on this level"
      />

      {!deckUnlocked ? (
        <CubKidTipCard title="Level locked">
          Finish the previous milestone first. Your parent can assign cards once this
          level unlocks.
          <div className="mt-3">
            <Link href={`/cub/${cub.id}/training`}>
              <Button variant="secondary" size="sm" className="font-bold">
                Back to map
              </Button>
            </Link>
          </div>
        </CubKidTipCard>
      ) : (
        <>
          <CubKidTipCard title="How lessons work">
            Cards are assigned by your parent. When one is ready, open it from{" "}
            <span className="font-semibold text-cub-gold-light">Overview</span>.
          </CubKidTipCard>

          <CubKidPanel variant="violet" contentClassName="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cub-gold-light">
              📚 Lessons in this level
            </p>
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
          </CubKidPanel>
        </>
      )}

      {deckComplete ? (
        <CubKidPanel variant="gold" contentClassName="space-y-3">
          <p className="text-lg font-black text-cub-off-white">You finished this level!</p>
          <p className="text-sm text-cub-muted">
            Nice work on {deck.title}. The next milestone is unlocked on your
            Training Path.
          </p>
          <Link href={`/cub/${cub.id}/training`}>
            <Button size="sm" className="font-bold">
              Back to map ▶
            </Button>
          </Link>
        </CubKidPanel>
      ) : null}
    </div>
  );
}
