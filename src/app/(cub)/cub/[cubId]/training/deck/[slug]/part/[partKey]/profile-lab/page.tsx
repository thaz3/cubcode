import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DouglassProfileLab } from "@/components/liberation-lab/douglass-profile-lab";
import { CubKidHero, CubKidPanel } from "@/components/cub-kid";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { requireCubForUser } from "@/lib/cub-access";
import { CUB_PAGE_EMOJI } from "@/lib/cub-kid-theme";
import {
  getDouglassProfileStorageKey,
  getDouglassProfileViewPath,
} from "@/lib/liberation-lab/douglass-profile-storage";
import { getTrainingPartDefinition } from "@/lib/training-deck-definitions";

type DouglassProfileLabPageProps = {
  params: Promise<{ cubId: string; slug: string; partKey: string }>;
};

export default async function DouglassProfileLabPage({ params }: DouglassProfileLabPageProps) {
  const { cubId, slug, partKey } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await requireCubForUser(cubId, session.user.id);

  const part = getTrainingPartDefinition(slug, partKey);
  if (!part || partKey !== "part-1-frederick-douglass") notFound();

  const labStep = part.card.labSteps?.find((step) => step.type === "LAB");
  const partHref = `/cub/${cubId}/training/deck/${slug}/part/${partKey}`;
  const storageKey = getDouglassProfileStorageKey(cubId, slug, partKey);
  const profileViewHref = getDouglassProfileViewPath(cubId, slug, partKey);

  return (
    <div className="space-y-5">
      <CubKidHero
        title={labStep?.title ?? "Frederick Douglass Profile Lab"}
        subtitle="Build a profile that shows how Douglass controlled his image, words, and public message."
        emoji={CUB_PAGE_EMOJI.level}
        backHref={partHref}
        backLabel="Back to part"
        action={
          <Link href={profileViewHref}>
            <Button
              type="button"
              size="md"
              className="border-2 border-kid-purple bg-white font-bold text-kid-purple hover:bg-violet-50"
            >
              View Profile Page
            </Button>
          </Link>
        }
      />

      <CubKidPanel variant="gold" contentClassName="space-y-4">
        <DouglassProfileLab storageKey={storageKey} profileViewHref={profileViewHref} />
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
