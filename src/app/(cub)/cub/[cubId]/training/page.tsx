import { redirect } from "next/navigation";
import { TrainingBoardPath } from "@/components/training-board-path";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { auth } from "@/lib/auth";
import { requireCubForUser } from "@/lib/cub-access";
import { getCubTrainingBoardSummary } from "@/lib/cub-training-board-summary";

type CubTrainingBoardPageProps = {
  params: Promise<{ cubId: string }>;
};

export default async function CubTrainingBoardPage({
  params,
}: CubTrainingBoardPageProps) {
  const { cubId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { cub, familyId } = await requireCubForUser(cubId, session.user.id);
  const { milestones } = await getCubTrainingBoardSummary(familyId, cub.id);

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Training Board"
        subtitle="See your path through the Code. Your parent assigns each card — you do the work in My tasks."
      />

      <Card className="p-4">
        <p className="text-sm text-cub-muted">
          Milestones unlock one at a time. When your parent assigns a training
          card, it shows up under{" "}
          <span className="font-medium text-cub-off-white">Assignments</span>.
        </p>
      </Card>

      <TrainingBoardPath
        milestones={milestones}
        cubId={cub.id}
        deckBasePath={`/cub/${cub.id}/training/deck`}
        readOnly
      />
    </div>
  );
}
