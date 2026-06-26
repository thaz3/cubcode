import { FocusActivityCardForm } from "@/components/focus-activity-card-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NewFocusDeckCardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Focus card"
        subtitle="Create a multi-area activity your Cub can choose from."
        backHref="/dashboard/focus-deck"
        backLabel="Focus Deck"
      />
      <Card>
        <FocusActivityCardForm submitLabel="Create card" />
      </Card>
    </div>
  );
}
