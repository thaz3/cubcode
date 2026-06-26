import Link from "next/link";
import { FocusCompletionSubmitForm } from "@/components/focus-completion-submit-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { auth } from "@/lib/auth";
import { requireCubForUser } from "@/lib/cub-access";
import { formatWeekLabel, getWeekStart } from "@/lib/council-day";
import { pickFocusCardFormAction } from "@/lib/actions/focus-deck";
import {
  formatFocusDeckCategoryPoints,
  parseFocusDeckCategoryPoints,
} from "@/lib/focus-deck-categories";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

type CubFocusDeckPageProps = {
  params: Promise<{ cubId: string }>;
};

export default async function CubFocusDeckPage({ params }: CubFocusDeckPageProps) {
  const { cubId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { familyId } = await requireCubForUser(cubId, session.user.id);
  const weekStartsOn = getWeekStart();

  const [stackItems, activeCompletions] = await Promise.all([
    db.focusDeckStackItem.findMany({
      where: { cubId, familyId, weekStartsOn },
      include: { card: true },
      orderBy: { createdAt: "asc" },
    }),
    db.focusActivityCompletion.findMany({
      where: {
        cubId,
        weekStartsOn,
        status: { in: ["IN_PROGRESS", "SUBMITTED", "SENT_BACK"] },
      },
      include: { card: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const inProgressIds = new Set(activeCompletions.map((c) => c.cardId));
  const rewardedCardIds = new Set(
    (
      await db.focusActivityCompletion.findMany({
        where: { cubId, weekStartsOn, status: "REWARDED" },
        select: { cardId: true },
      })
    ).map((c) => c.cardId),
  );

  const availableStack = stackItems.filter(
    (item) =>
      item.card.status === "ACTIVE" &&
      !inProgressIds.has(item.cardId) &&
      !rewardedCardIds.has(item.cardId),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Focus Deck"
        subtitle={`Pick a card for ${formatWeekLabel(weekStartsOn)}. One real-world activity, multiple growth areas.`}
      />

      {activeCompletions.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-100">In progress</h2>
          {activeCompletions.map((completion) => {
            const points = parseFocusDeckCategoryPoints(completion.card.categoryPoints);
            const pointsLabel = points ? formatFocusDeckCategoryPoints(points) : "";

            return (
              <Card key={completion.id} className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-100">
                    {completion.card.title}
                  </h3>
                  {completion.card.instructions ? (
                    <p className="mt-2 text-sm text-zinc-400">
                      {completion.card.instructions}
                    </p>
                  ) : null}
                  {pointsLabel ? (
                    <p className="mt-2 text-sm text-cub-gold/90">{pointsLabel}</p>
                  ) : null}
                  <p className="mt-1 text-xs text-zinc-500">Status: {completion.status}</p>
                </div>
                <FocusCompletionSubmitForm completion={completion} card={completion.card} />
              </Card>
            );
          })}
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-100">Your deck this week</h2>
        {availableStack.length === 0 ? (
          <EmptyState
            title="No cards available"
            description="Ask your parent to add Focus cards to your deck for this week."
          />
        ) : (
          <ul className="space-y-3">
            {availableStack.map((item) => {
              const points = parseFocusDeckCategoryPoints(item.card.categoryPoints);
              const pointsLabel = points ? formatFocusDeckCategoryPoints(points) : "";

              return (
                <li key={item.id}>
                  <Card className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-zinc-100">{item.card.title}</h3>
                      {item.card.description ? (
                        <p className="mt-1 text-sm text-zinc-400">{item.card.description}</p>
                      ) : null}
                      {pointsLabel ? (
                        <p className="mt-2 text-sm text-cub-gold/90">{pointsLabel}</p>
                      ) : null}
                      {item.card.estimatedMinutes ? (
                        <p className="mt-1 text-xs text-zinc-500">
                          About {item.card.estimatedMinutes} min
                        </p>
                      ) : null}
                    </div>
                    <form action={pickFocusCardFormAction}>
                      <input type="hidden" name="cubId" value={cubId} />
                      <input type="hidden" name="cardId" value={item.cardId} />
                      <Button type="submit" variant="constructive">
                        Pick this card
                      </Button>
                    </form>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <Link href={`/cub/${cubId}/progress`} className="text-sm font-medium text-cub-gold-light">
        View Focus Deck growth chart →
      </Link>
    </div>
  );
}
