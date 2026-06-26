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
        title="Training Path"
        subtitle="Level up through Black history, identity, culture, and life lessons."
        emoji={CUB_PAGE_EMOJI.training}
        backHref={`/cub/${cubId}`}
        backLabel="Today"
      />

      <CubKidTipCard title="Your quest map is below">
        Tap <span className="font-semibold text-sky-400">Play</span> on your current level. When
        your parent assigns a lesson, it shows up in{" "}
        <span className="font-semibold text-cub-gold-light">Overview</span>.
      </CubKidTipCard>

      <CubTrainingPathAdventure
        summary={summary}
        deckBasePath={`/cub/${cub.id}/training/deck`}
        cubXp={ledger.totalXp}
      />
    </div>
  );
}
