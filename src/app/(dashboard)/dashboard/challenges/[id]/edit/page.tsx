import { ChallengeForm } from "@/components/challenge-form";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getFamilyForUser } from "@/lib/session";
import { notFound, redirect } from "next/navigation";

type EditChallengePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditChallengePage({ params }: EditChallengePageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const family = await getFamilyForUser(session.user.id);
  if (!family) redirect("/signup");

  const challenge = await db.challenge.findFirst({
    where: { id, familyId: family.id },
  });

  if (!challenge) notFound();
  if (challenge.status === "ARCHIVED") {
    redirect(`/dashboard/challenges/${challenge.id}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit challenge"
        subtitle={challenge.title}
        backHref={`/dashboard/challenges/${challenge.id}`}
        backLabel="Challenge"
      />

      <Card className="p-4 sm:p-6">
        <ChallengeForm
          cubs={family.cubs}
          challenge={challenge}
          submitLabel="Save changes"
        />
      </Card>
    </div>
  );
}
