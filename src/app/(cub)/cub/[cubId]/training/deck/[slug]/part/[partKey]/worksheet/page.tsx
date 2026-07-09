import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BooksArePowerWorksheet } from "@/components/liberation-lab/books-are-power-worksheet";
import { CubKidHero, CubKidPanel } from "@/components/cub-kid";
import { auth } from "@/lib/auth";
import { requireCubForUser } from "@/lib/cub-access";
import { CUB_PAGE_EMOJI } from "@/lib/cub-kid-theme";
import { getTrainingPartDefinition } from "@/lib/training-deck-definitions";

type BooksArePowerWorksheetPageProps = {
  params: Promise<{ cubId: string; slug: string; partKey: string }>;
};

export default async function BooksArePowerWorksheetPage({
  params,
}: BooksArePowerWorksheetPageProps) {
  const { cubId, slug, partKey } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await requireCubForUser(cubId, session.user.id);

  const part = getTrainingPartDefinition(slug, partKey);
  if (!part) notFound();

  const worksheetStep = part.card.labSteps?.find((step) => step.type === "WORKSHEET");
  const partHref = `/cub/${cubId}/training/deck/${slug}/part/${partKey}`;

  return (
    <div className="space-y-5">
      <CubKidHero
        title={worksheetStep?.title ?? "Books Are Power Worksheet"}
        subtitle="Choose a book from the Frederick Douglass reading list and reflect on the power of words."
        emoji={CUB_PAGE_EMOJI.level}
        backHref={partHref}
        backLabel="Back to part"
      />

      <CubKidPanel variant="gold" contentClassName="space-y-4">
        <BooksArePowerWorksheet cubId={cubId} deckSlug={slug} />
      </CubKidPanel>

      <div className="text-center">
        <Link
          href={partHref}
          className="text-sm font-bold text-kid-purple underline underline-offset-2"
        >
          ← Return to mission steps
        </Link>
      </div>
    </div>
  );
}
