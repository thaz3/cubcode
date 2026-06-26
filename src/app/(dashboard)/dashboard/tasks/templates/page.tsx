import { redirect } from "next/navigation";
import { FamilyTrainingProgressTracker } from "@/components/family-training-progress-tracker";
import { TrainingBoardPath } from "@/components/training-board-path";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getFamilyTrainingBoardSummaries } from "@/lib/cub-training-board-summary";
import {
  ensureTrainingBoardSeeded,
  getTrainingDecksForFamily,
} from "@/lib/training-deck-seed";
import { getFamilyForUser } from "@/lib/session";

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

  const [decks, cubSummaries] = await Promise.all([
    getTrainingDecksForFamily(family.id),
    getFamilyTrainingBoardSummaries(family.id, family.cubs),
  ]);

  const selectedSummary = cubSummaries.find((s) => s.cubId === cub?.id);
  const milestones = selectedSummary?.milestones ?? decks.map((deck) => ({
    slug: deck.slug,
    milestoneNumber: deck.milestoneNumber,
    title: deck.title,
    description: deck.description ?? "",
    status: "LOCKED" as const,
    approvedCount: 0,
    totalCards: deck.cards.length,
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Training Path"
        subtitle="Complete each level to unlock the next part of the Code."
        backHref="/dashboard/tasks"
        backLabel="Assignments"
        action={
          <Link href="/dashboard/focus-deck">
            <Button variant="secondary" size="lg">
              Growth Picks
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
          <FamilyTrainingProgressTracker
            summaries={cubSummaries}
            selectedCubId={cub?.id}
          />

          {cub ? (
            <>
              <div>
                <h2 className="text-lg font-semibold text-cub-off-white">
                  {cub.displayName}&apos;s milestones
                </h2>
                <p className="mt-1 text-sm text-cub-muted">
                  Locked decks can still be previewed. Assign cards when a
                  milestone is unlocked for this Cub.
                </p>
              </div>
              <TrainingBoardPath
                milestones={milestones}
                cubId={cub.id}
                allowLockedView
              />
            </>
          ) : null}
        </>
      )}
    </div>
  );
}
