import { FocusActivityCardForm } from "@/components/focus-activity-card-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getFamilyForUser } from "@/lib/session";
import { redirect, notFound } from "next/navigation";

type EditFocusDeckCardPageProps = {
  params: Promise<{ cardId: string }>;
};

export default async function EditFocusDeckCardPage({
  params,
}: EditFocusDeckCardPageProps) {
  const { cardId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const family = await getFamilyForUser(session.user.id);
  if (!family) redirect("/signup");

  const card = await db.focusActivityCard.findFirst({
    where: { id: cardId, familyId: family.id },
  });
  if (!card) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={card.title}
        subtitle="Edit Focus activity card"
        backHref="/dashboard/focus-deck"
        backLabel="Growth Picks"
      />
      <Card>
        <FocusActivityCardForm card={card} submitLabel="Save changes" />
      </Card>
    </div>
  );
}
