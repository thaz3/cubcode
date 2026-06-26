import Link from "next/link";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { EarnTypeBadge } from "@/components/earn-type-badge";
import type { CubFocusWeekCard } from "@/lib/cub-focus-deck-week";
import { cubSectionTitle } from "@/lib/cub-theme";
import { cn } from "@/lib/utils";

const STATUS_PILL: Record<
  CubFocusWeekCard["status"],
  string
> = {
  AVAILABLE: "bg-cub-gold-muted text-cub-gold-light",
  IN_PROGRESS: "bg-sky-950 text-sky-200 ring-1 ring-sky-400/30",
  SUBMITTED: "bg-violet-950 text-violet-200",
  SENT_BACK: "bg-orange-950 text-orange-200",
  REWARDED: "bg-cub-green-muted text-cub-green-light",
};

type CubFocusWeekSectionProps = {
  cubId: string;
  cards: CubFocusWeekCard[];
  variant?: "default" | "compact";
};

export function CubFocusWeekSection({
  cubId,
  cards,
  variant = "default",
}: CubFocusWeekSectionProps) {
  const isCompact = variant === "compact";
  const preview = cards.slice(0, isCompact ? 3 : 6);
  const focusHref = `/cub/${cubId}/focus-deck`;

  const content =
    cards.length === 0 ? (
      isCompact ? (
        <p className="text-xs text-cub-muted">
          No Growth Picks picked for this week yet.
        </p>
      ) : (
        <EmptyState
          title="No Growth Picks this week"
          description="When your parent adds Growth Picks to your weekly chart, they will show up here."
          actionLabel="Open Growth Picks"
          actionHref={focusHref}
        />
      )
    ) : (
      <ul className={isCompact ? "space-y-1.5" : "space-y-2"}>
        {preview.map((card) => (
          <li key={card.stackItemId}>
            <Link href={focusHref}>
              <Card
                variant="constructive"
                className={cn(
                  isCompact ? "px-3 py-2" : "space-y-2 py-4",
                  "border-cub-gold/20 hover:border-cub-gold/40",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <EarnTypeBadge earnType="growth_pick" />
                    <p
                      className={
                        isCompact
                          ? "truncate text-sm font-medium text-cub-off-white"
                          : "font-medium text-cub-off-white"
                      }
                    >
                      {card.title}
                    </p>
                    {!isCompact && card.description ? (
                      <p className="mt-1 text-sm text-cub-muted line-clamp-2">
                        {card.description}
                      </p>
                    ) : null}
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      STATUS_PILL[card.status],
                    )}
                  >
                    {isCompact
                      ? card.status === "AVAILABLE"
                        ? "Pick"
                        : card.status === "REWARDED"
                          ? "Done"
                          : card.status === "SUBMITTED"
                            ? "Review"
                            : card.status === "IN_PROGRESS"
                              ? "Go"
                              : "Fix"
                      : card.statusLabel}
                  </span>
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    );

  if (isCompact) {
    return (
      <Card className="h-full space-y-2 border-cub-gold/20 bg-cub-charcoal/40 p-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-cub-off-white">Growth Picks</h2>
          <Link
            href={focusHref}
            className="text-xs font-medium text-cub-gold hover:text-cub-gold-light"
          >
            Open →
          </Link>
        </div>
        {content}
      </Card>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className={cubSectionTitle}>Growth Picks</h2>
        <Link
          href={focusHref}
          className="text-sm font-medium text-cub-gold hover:text-cub-gold-light"
        >
          Growth Picks →
        </Link>
      </div>
      {content}
      {cards.length > preview.length ? (
        <p className="text-xs text-cub-muted">
          +{cards.length - preview.length} more Growth Picks
        </p>
      ) : null}
    </section>
  );
}
