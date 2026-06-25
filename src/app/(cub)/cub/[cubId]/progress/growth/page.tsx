import { GrowthBoardPanels } from "@/components/growth-board-panels";
import { PageHeader } from "@/components/ui/page-header";
import { auth } from "@/lib/auth";
import { requireCubForUser } from "@/lib/cub-access";
import { getGrowthBoardView } from "@/lib/growth-board";
import { redirect } from "next/navigation";

type CubGrowthBoardPageProps = {
  params: Promise<{ cubId: string }>;
};

export default async function CubGrowthBoardPage({
  params,
}: CubGrowthBoardPageProps) {
  const { cubId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { cub, familyId } = await requireCubForUser(cubId, session.user.id);
  const board = await getGrowthBoardView(cub, familyId);

  return (
    <>
      <PageHeader
        title="Growth boards"
        subtitle="Pick focus sessions and claim work in each growth area. One active focus session per area."
      />

      <GrowthBoardPanels cubId={cubId} board={board} />
    </>
  );
}
