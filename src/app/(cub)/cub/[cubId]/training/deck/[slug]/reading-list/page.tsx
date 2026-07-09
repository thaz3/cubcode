import { notFound, redirect } from "next/navigation";
import { FrederickDouglassReadingListBrowser } from "@/components/liberation-lab/frederick-douglass-reading-list-browser";
import { CubKidHero, CubKidPanel } from "@/components/cub-kid";
import { auth } from "@/lib/auth";
import { requireCubForUser } from "@/lib/cub-access";
import { CUB_PAGE_EMOJI } from "@/lib/cub-kid-theme";
import { getTrainingPartDefinition } from "@/lib/training-deck-definitions";

const PART_1_KEY = "part-1-frederick-douglass";

type FrederickDouglassReadingListPageProps = {
  params: Promise<{ cubId: string; slug: string }>;
};

export default async function FrederickDouglassReadingListPage({
  params,
}: FrederickDouglassReadingListPageProps) {
  const { cubId, slug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await requireCubForUser(cubId, session.user.id);

  const part = getTrainingPartDefinition(slug, PART_1_KEY);
  if (!part) notFound();

  const partHref = `/cub/${cubId}/training/deck/${slug}/part/${PART_1_KEY}`;

  return (
    <div className="space-y-5">
      <CubKidHero
        title="Frederick Douglass Reading List"
        subtitle="Choose a book for the Books Are Power Worksheet."
        emoji={CUB_PAGE_EMOJI.level}
        backHref={partHref}
        backLabel="Back to part"
      />

      <CubKidPanel variant="gold" contentClassName="space-y-4">
        <FrederickDouglassReadingListBrowser
          cubId={cubId}
          deckSlug={slug}
          partKey={PART_1_KEY}
        />
      </CubKidPanel>
    </div>
  );
}
