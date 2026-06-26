import { ChallengeForm } from "@/components/challenge-form";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { auth } from "@/lib/auth";
import { findRoutineGroupMembersByChallengeId } from "@/lib/assignment-routine-groups";
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

  const [challenge, familyChallenges] = await Promise.all([
    db.challenge.findFirst({
      where: { id, familyId: family.id },
    }),
    db.challenge.findMany({
      where: { familyId: family.id, status: { not: "ARCHIVED" } },
      select: {
        id: true,
        title: true,
        intervalType: true,
        intervalConfig: true,
        proofType: true,
        status: true,
        cubId: true,
      },
    }),
  ]);

  if (!challenge) notFound();
  if (challenge.status === "ARCHIVED") {
    redirect(`/dashboard/challenges/${challenge.id}`);
  }

  const groupMembers = findRoutineGroupMembersByChallengeId(id, familyChallenges);
  const assignedCubIds = groupMembers.map((member) => member.cubId);
  const groupMemberIds = groupMembers.map((member) => member.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit routine"
        subtitle={challenge.title}
        backHref="/dashboard/tasks#routines"
        backLabel="Routines"
      />

      <Card className="p-4 sm:p-6">
        <ChallengeForm
          cubs={family.cubs}
          challenge={challenge}
          assignedCubIds={assignedCubIds}
          groupMemberIds={groupMemberIds}
          submitLabel="Save routine"
        />
      </Card>
    </div>
  );
}
