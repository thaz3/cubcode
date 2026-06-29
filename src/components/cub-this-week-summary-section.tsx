import Link from "next/link";
import { CubKidPanel } from "@/components/cub-kid/cub-kid-panel";
import { CubKidSectionHeader } from "@/components/cub-kid/cub-kid-section-header";
import { EarnTypeBadge } from "@/components/earn-type-badge";
import type { CubWeekEarnSummary } from "@/lib/cub-week-earn-summary";
import {
  cubKidBadge,
  cubKidGameCard,
  EARN_TYPE_EMOJI,
  KID_EARN_CARD,
} from "@/lib/cub-kid-theme";
import { cn } from "@/lib/utils";

type CubThisWeekSummarySectionProps = {
  cubId: string;
  summary: CubWeekEarnSummary;
  variant?: "default" | "compact";
  sectionTitle?: string;
  sectionSubtitle?: string;
};

export function CubThisWeekSummarySection({
  cubId,
  summary,
  variant = "default",
  sectionTitle = "This Week",
  sectionSubtitle = "Your progress across all five ways to earn — keep stacking wins!",
}: CubThisWeekSummarySectionProps) {
  const isCompact = variant === "compact";
  const growthMet =
    summary.growthPicksCompleted >= summary.growthPicksMinimum;

  const rows = [
    {
      earnType: "routine" as const,
      label: "Routines completed",
      value: String(summary.routinesCompleted),
      href: `/cub/${cubId}/challenges`,
    },
    {
      earnType: "task" as const,
      label: "Tasks completed",
      value: String(summary.tasksCompleted),
      href: `/cub/${cubId}/challenges#assignments`,
    },
    {
      earnType: "growth_pick" as const,
      label: "Growth Picks",
      value: `${summary.growthPicksCompleted}/${summary.growthPicksMinimum}`,
      href: `/cub/${cubId}/focus-deck`,
      highlight: growthMet ? "met" : "pending",
    },
    {
      earnType: "training_path" as const,
      label: "Training Path",
      value: summary.trainingPathCurrentLevel ?? "Not started",
      sub: summary.trainingPathProgressLabel,
      href: `/cub/${cubId}/training`,
    },
    {
      earnType: "bonus" as const,
      label: "Bonus points",
      value: `+${summary.bonusPointsAwarded} XP`,
      href: `/cub/${cubId}/progress`,
    },
  ];

  if (isCompact) {
    return (
      <CubKidPanel variant="gold" contentClassName="space-y-3">
        <CubKidSectionHeader
          eyebrow="📊 Weekly Scoreboard"
          title={sectionTitle}
          compact
          trailing={
            <Link href={`/cub/${cubId}/progress`} className={cubKidBadge}>
              Progress →
            </Link>
          }
        />
        <ul className="space-y-1.5">
          {rows.map((row) => (
            <li key={row.earnType}>
              <Link
                href={row.href}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-2xl border-2 bg-white px-2.5 py-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
                  KID_EARN_CARD[row.earnType].border,
                )}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="text-sm" aria-hidden>
                    {EARN_TYPE_EMOJI[row.earnType]}
                  </span>
                  <EarnTypeBadge earnType={row.earnType} size="sm" />
                  <span className="truncate text-xs text-kid-ink-muted">{row.label}</span>
                </div>
                <span
                  className={cn(
                    "shrink-0 text-xs font-black",
                    row.highlight === "met"
                      ? "text-emerald-600"
                      : row.highlight === "pending"
                        ? "text-orange-600"
                        : "text-kid-ink",
                  )}
                >
                  {row.value}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </CubKidPanel>
    );
  }

  return (
    <section className="space-y-3">
      <CubKidSectionHeader
        eyebrow="📊 Weekly Scoreboard"
        title={sectionTitle}
        subtitle={sectionSubtitle}
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row) => (
          <Link key={row.earnType} href={row.href}>
            <div
              className={cn(
                "h-full space-y-2 rounded-2xl border-[3px] bg-gradient-to-br p-4 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg",
                cubKidGameCard,
                KID_EARN_CARD[row.earnType].border,
                KID_EARN_CARD[row.earnType].accent,
                row.highlight === "met" && "ring-2 ring-emerald-300",
                row.highlight === "pending" && "ring-2 ring-kid-yellow/50",
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl" aria-hidden>
                  {EARN_TYPE_EMOJI[row.earnType]}
                </span>
                <EarnTypeBadge earnType={row.earnType} />
              </div>
              <p className="text-sm text-kid-ink-muted">{row.label}</p>
              <p className="text-lg font-black text-kid-ink">{row.value}</p>
              {row.sub ? (
                <p className="text-xs text-kid-ink-muted">{row.sub}</p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
