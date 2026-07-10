import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DouglassProfilePageView } from "@/components/liberation-lab/douglass-profile-page-view";
import { CubKidHero, CubKidPanel } from "@/components/cub-kid";
import { auth } from "@/lib/auth";
import { requireCubForUser } from "@/lib/cub-access";
import { CUB_PAGE_EMOJI } from "@/lib/cub-kid-theme";
import {
  getDouglassProfileLabPath,
  getDouglassProfileStorageKey,
} from "@/lib/liberation-lab/douglass-profile-storage";
import { getTrainingPartDefinition } from "@/lib/training-deck-definitions";

type DouglassProfileViewPageProps = {
  params: Promise<{ cubId: string; slug: string; partKey: string }>;
};

export default async function DouglassProfileViewPage({ params }: DouglassProfileViewPageProps) {
  const { cubId, slug, partKey } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await requireCubForUser(cubId, session.user.id);

  const part = getTrainingPartDefinition(slug, partKey);
  if (!part || partKey !== "part-1-frederick-douglass") notFound();

  const partHref = `/cub/${cubId}/training/deck/${slug}/part/${partKey}`;
  const storageKey = getDouglassProfileStorageKey(cubId, slug, partKey);
  const profileLabHref = getDouglassProfileLabPath(cubId, slug, partKey);

  return (
    <div className="space-y-5">
      <CubKidHero
        title="Your Douglass Profile"
        subtitle="See your Liberation Lab profile the way it would look as a public page."
        emoji={CUB_PAGE_EMOJI.level}
        backHref={partHref}
        backLabel="Back to part"
      />

      <CubKidPanel variant="violet" contentClassName="space-y-4">
        <DouglassProfilePageView
          storageKey={storageKey}
          profileLabHref={profileLabHref}
          backHref={partHref}
        />
      </CubKidPanel>

      <div className="flex flex-col items-center gap-2 text-center">
        <Link
          href={profileLabHref}
          className="text-sm font-bold text-kid-purple underline underline-offset-2"
        >
          Edit profile in Lab
        </Link>
        <Link
          href={partHref}
          className="text-sm font-bold text-kid-ink-muted underline underline-offset-2"
        >
          ← Return to mission steps
        </Link>
      </div>
    </div>
  );
}
