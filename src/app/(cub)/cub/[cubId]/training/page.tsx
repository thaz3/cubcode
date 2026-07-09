import { redirect } from "next/navigation";
import { CubTrainingPathAdventure } from "@/components/cub-training-path-adventure";
import { CubKidHero, CubKidTipCard } from "@/components/cub-kid";
import { auth } from "@/lib/auth";
import { requireCubForUser } from "@/lib/cub-access";
import { CUB_PAGE_EMOJI } from "@/lib/cub-kid-theme";
import { getCubTrainingBoardSummary } from "@/lib/cub-training-board-summary";
import { sumLedgerAmounts } from "@/lib/rewards";

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
  const [summary, ledger] = await Promise.all([
    getCubTrainingBoardSummary(familyId, cub.id),
    sumLedgerAmounts(cub.id),
  ]);

  return (
    <div className="space-y-5">
      <CubKidHero
        title="Liberation Lab"
        subtitle="History is action, not memorization. Complete Black history missions, build digital artifacts, and earn XP through strategy, literacy, voice, and courage."
        emoji={CUB_PAGE_EMOJI.training}
        backHref={`/cub/${cubId}`}
        backLabel="Today"
      />

      <CubKidTipCard title="Your Liberation Lab map is below">
        Tap <span className="font-semibold text-sky-400">Enter Lab</span> on your current
        milestone. Complete each lesson to unlock the next lab.
      </CubKidTipCard>

      <CubTrainingPathAdventure
        summary={summary}
        deckBasePath={`/cub/${cub.id}/training/deck`}
        cubXp={ledger.totalXp}
      />
    </div>
  );
}
