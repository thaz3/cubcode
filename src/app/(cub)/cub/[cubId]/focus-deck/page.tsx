import { MissionHashScroll } from "@/components/mission-hash-scroll";
import { EarnTypeBadge } from "@/components/earn-type-badge";
import Link from "next/link";
import { FocusCompletionSubmitForm } from "@/components/focus-completion-submit-form";
import { CubKidHero, CubKidPanel } from "@/components/cub-kid";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { auth } from "@/lib/auth";
import { requireCubForUser } from "@/lib/cub-access";
import { formatWeekLabel, getWeekStart } from "@/lib/council-day";
import { pickFocusCardFormAction } from "@/lib/actions/focus-deck";
import {
  formatFocusDeckCategoryPoints,
  parseFocusDeckCategoryPoints,
} from "@/lib/focus-deck-categories";
import { CUB_PAGE_EMOJI, cubKidGameCard } from "@/lib/cub-kid-theme";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";

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
    <div className="space-y-5">
      <MissionHashScroll />
      <CubKidHero
        title="Growth Picks"
        subtitle={`Pick a Growth Pick for ${formatWeekLabel(weekStartsOn)}. Choice-based activities across the five Cub Code growth areas.`}
        emoji={CUB_PAGE_EMOJI.growthPicks}
        backHref={`/cub/${cubId}`}
        backLabel="Today"
      />

      {activeCompletions.length > 0 ? (
        <CubKidPanel variant="gold" contentClassName="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cub-gold-light">
            🌱 In progress
          </p>
          {activeCompletions.map((completion) => {
            const points = parseFocusDeckCategoryPoints(completion.card.categoryPoints);
            const pointsLabel = points ? formatFocusDeckCategoryPoints(points) : "";

            return (
              <div
                key={completion.id}
                id={`pick-${completion.cardId}`}
                className={cn(
                  cubKidGameCard,
                  "scroll-mt-24 space-y-3 border-cub-green-bright/35 bg-gradient-to-br from-cub-green-muted/20 to-cub-charcoal p-4",
                )}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <EarnTypeBadge earnType="growth_pick" />
                    <h3 className="text-lg font-bold text-cub-off-white">
                      {completion.card.title}
                    </h3>
                  </div>
                  {completion.card.instructions ? (
                    <p className="mt-2 text-sm text-cub-muted">
                      {completion.card.instructions}
                    </p>
                  ) : null}
                  {pointsLabel ? (
                    <p className="mt-2 text-sm text-cub-gold/90">{pointsLabel}</p>
                  ) : null}
                  <p className="mt-1 text-xs font-bold text-cub-green-light">
                    Status: {completion.status}
                  </p>
                </div>
                <FocusCompletionSubmitForm completion={completion} card={completion.card} />
              </div>
            );
          })}
        </CubKidPanel>
      ) : null}

      <CubKidPanel variant="violet" contentClassName="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cub-gold-light">
          ✨ Your picks this week
        </p>
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
                  <div
                    id={`pick-${item.cardId}`}
                    className={cn(
                      cubKidGameCard,
                      "scroll-mt-24 space-y-3 border-cub-green-bright/25 bg-gradient-to-br from-cub-charcoal to-cub-ebony p-4",
                    )}
                  >
                    <div>
                      <h3 className="font-bold text-cub-off-white">{item.card.title}</h3>
                      {item.card.description ? (
                        <p className="mt-1 text-sm text-cub-muted">{item.card.description}</p>
                      ) : null}
                      {pointsLabel ? (
                        <p className="mt-2 text-sm text-cub-gold/90">{pointsLabel}</p>
                      ) : null}
                      {item.card.estimatedMinutes ? (
                        <p className="mt-1 text-xs text-cub-muted">
                          About {item.card.estimatedMinutes} min
                        </p>
                      ) : null}
                    </div>
                    <form action={pickFocusCardFormAction}>
                      <input type="hidden" name="cubId" value={cubId} />
                      <input type="hidden" name="cardId" value={item.cardId} />
                      <Button type="submit" variant="constructive" className="font-bold">
                        Pick this card ▶
                      </Button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CubKidPanel>

      <Link
        href={`/cub/${cubId}/progress`}
        className="inline-flex rounded-xl border border-violet-500/25 bg-violet-950/30 px-3 py-2 text-sm font-bold text-violet-200 hover:text-cub-gold-light"
      >
        View Growth Chart →
      </Link>
    </div>
  );
}
