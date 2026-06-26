import Link from "next/link";
import { FocusActivityCardForm } from "@/components/focus-activity-card-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { PageHeader } from "@/components/ui/page-header";
import { auth } from "@/lib/auth";
import { formatWeekLabel, getWeekStart } from "@/lib/council-day";
import { ensureFocusDeckStarterCards } from "@/lib/focus-deck-seed";
import {
  addCardToWeeklyStackFormAction,
  archiveFocusActivityCardFormAction,
  removeCardFromWeeklyStackFormAction,
} from "@/lib/actions/focus-deck";
import { formatFocusDeckCategoryPoints, parseFocusDeckCategoryPoints } from "@/lib/focus-deck-categories";
import { db } from "@/lib/db";
import { getFamilyForUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function FocusDeckDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const family = await getFamilyForUser(session.user.id);
  if (!family) redirect("/signup");

  await ensureFocusDeckStarterCards(family.id, session.user.id);

  const weekStartsOn = getWeekStart();

  const [cards, stackItems] = await Promise.all([
    db.focusActivityCard.findMany({
      where: { familyId: family.id, status: { not: "ARCHIVED" } },
      orderBy: [{ status: "asc" }, { title: "asc" }],
    }),
    db.focusDeckStackItem.findMany({
      where: { familyId: family.id, weekStartsOn },
      include: {
        card: { select: { title: true } },
        cub: { select: { displayName: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Focus Decks"
        subtitle="Parent-approved activity cards with multi-area growth points."
        action={
          <Link href="/dashboard/focus-deck/new">
            <Button>New card</Button>
          </Link>
        }
      />

      <CollapsibleSection
        title={`This week's decks · ${formatWeekLabel(weekStartsOn)}`}
        summary={
          stackItems.length === 0
            ? "No cards on any Cub deck yet this week."
            : `${stackItems.length} card${stackItems.length === 1 ? "" : "s"} on deck · tap to manage`
        }
      >
        {stackItems.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Add active cards to each Cub&apos;s stack for the week from Your cards below.
          </p>
        ) : (
          <ul className="space-y-2">
            {stackItems.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-cub-charcoal bg-cub-ebony/50 px-4 py-3"
              >
                <span className="text-sm text-zinc-100">
                  <span className="font-medium">{item.cub.displayName}</span>
                  {" · "}
                  {item.card.title}
                </span>
                <form action={removeCardFromWeeklyStackFormAction}>
                  <input type="hidden" name="stackItemId" value={item.id} />
                  <Button type="submit" variant="ghost" size="sm">
                    Remove
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </CollapsibleSection>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-100">Your cards</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {cards.map((card) => {
            const points = parseFocusDeckCategoryPoints(card.categoryPoints);
            const pointsLabel = points ? formatFocusDeckCategoryPoints(points) : "";

            return (
              <Card key={card.id} className="space-y-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-zinc-100">{card.title}</h3>
                    <span className="rounded-full bg-cub-charcoal px-2 py-0.5 text-xs text-cub-muted">
                      {card.status === "ACTIVE" ? "Active" : "Draft"}
                    </span>
                    {card.starterKey ? (
                      <span className="rounded-full bg-cub-gold-muted px-2 py-0.5 text-xs text-cub-gold-light">
                        Starter
                      </span>
                    ) : null}
                  </div>
                  {card.description ? (
                    <p className="mt-2 text-sm text-zinc-400">{card.description}</p>
                  ) : null}
                  {pointsLabel ? (
                    <p className="mt-2 text-sm text-cub-gold/90">{pointsLabel}</p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link href={`/dashboard/focus-deck/${card.id}/edit`}>
                    <Button variant="neutral" size="sm">
                      Edit
                    </Button>
                  </Link>
                  {card.status === "ACTIVE"
                    ? family.cubs.map((cub) => (
                        <form key={cub.id} action={addCardToWeeklyStackFormAction}>
                          <input type="hidden" name="cardId" value={card.id} />
                          <input type="hidden" name="cubId" value={cub.id} />
                          <Button type="submit" variant="constructive" size="sm">
                            + {cub.displayName}
                          </Button>
                        </form>
                      ))
                    : null}
                  <form action={archiveFocusActivityCardFormAction}>
                    <input type="hidden" name="cardId" value={card.id} />
                    <Button type="submit" variant="ghost" size="sm">
                      Archive
                    </Button>
                  </form>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
