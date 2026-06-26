import Link from "next/link";
import { redirect } from "next/navigation";
import { TrainingBoardPath } from "@/components/training-board-path";
import { CubColorBadge } from "@/components/cub-color-dot";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { TrainingDeckBoardStatus } from "@/lib/training-board-progress";
import {
  buildLatestTasksByCardId,
  countApprovedCardsForDeck,
  getTrainingDeckBoardStatus,
} from "@/lib/training-board-progress";
import {
  ensureTrainingBoardSeeded,
  getTrainingDecksForFamily,
} from "@/lib/training-deck-seed";
import { getFamilyForUser } from "@/lib/session";
import { cn } from "@/lib/utils";

type TrainingBoardPageProps = {
  searchParams: Promise<{ cubId?: string }>;
};

export default async function TrainingBoardPage({
  searchParams,
}: TrainingBoardPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const family = await getFamilyForUser(session.user.id);
  if (!family) redirect("/signup");

  await ensureTrainingBoardSeeded(family.id);

  const params = await searchParams;
  const cub =
    family.cubs.find((c) => c.id === params.cubId) ?? family.cubs[0] ?? null;

  const decks = await getTrainingDecksForFamily(family.id);

  let milestones: Array<{
    slug: string;
    milestoneNumber: number;
    title: string;
    description: string;
    status: TrainingDeckBoardStatus;
    approvedCount: number;
    totalCards: number;
  }> = decks.map((deck) => ({
    slug: deck.slug,
    milestoneNumber: deck.milestoneNumber,
    title: deck.title,
    description: deck.description ?? "",
    status: "LOCKED" as const,
    approvedCount: 0,
    totalCards: deck.cards.length,
  }));

  if (cub) {
    const cubTasks = await db.task.findMany({
      where: {
        familyId: family.id,
        cubId: cub.id,
        focusActivityCardId: { not: null },
      },
      select: {
        id: true,
        status: true,
        focusActivityCardId: true,
        updatedAt: true,
      },
    });

    const tasksByCardId = buildLatestTasksByCardId(cubTasks);

    milestones = decks.map((deck) => ({
      slug: deck.slug,
      milestoneNumber: deck.milestoneNumber,
      title: deck.title,
      description: deck.description ?? "",
      status: getTrainingDeckBoardStatus(deck, decks, tasksByCardId),
      approvedCount: countApprovedCardsForDeck(deck, tasksByCardId),
      totalCards: deck.cards.length,
    }));
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Cub Training Board"
        subtitle="Complete each Focus Deck to unlock the next part of the Code."
        backHref="/dashboard/tasks"
        backLabel="Assignments"
        action={
          <Link href="/dashboard/focus-deck">
            <Button variant="secondary" size="lg">
              Manage Decks
            </Button>
          </Link>
        }
      />

      {family.cubs.length === 0 ? (
        <Card>
          <p className="text-sm text-cub-muted">
            Add a Cub profile to start the training path.
          </p>
        </Card>
      ) : (
        <>
          <Card className="p-4">
            <p className="text-sm font-medium text-cub-off-white">Training path for</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {family.cubs.map((familyCub) => (
                <Link
                  key={familyCub.id}
                  href={`/dashboard/tasks/templates?cubId=${familyCub.id}`}
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
          </Card>

          {cub ? (
            <TrainingBoardPath milestones={milestones} cubId={cub.id} />
          ) : null}
        </>
      )}
    </div>
  );
}
