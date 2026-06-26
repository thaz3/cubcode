import Link from "next/link";
import { CubKidPanel } from "@/components/cub-kid/cub-kid-panel";
import { CubKidSectionHeader } from "@/components/cub-kid/cub-kid-section-header";
import { EarnTypeBadge } from "@/components/earn-type-badge";
import type { CubWeekEarnSummary } from "@/lib/cub-week-earn-summary";
import { EARN_TYPE_EMOJI } from "@/lib/cub-kid-theme";
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
  sectionSubtitle = "Your progress across all five ways to earn.",
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
          eyebrow="📊 Scoreboard"
          title={sectionTitle}
          compact
          trailing={
            <Link
              href={`/cub/${cubId}/progress`}
              className="rounded-lg border border-cub-gold/30 bg-cub-gold-muted/20 px-2 py-0.5 text-[10px] font-bold text-cub-gold-light hover:text-cub-gold-warm"
            >
              Progress →
            </Link>
          }
        />
        <ul className="space-y-1.5">
          {rows.map((row) => (
            <li key={row.earnType}>
              <Link
                href={row.href}
                className="flex items-center justify-between gap-2 rounded-xl border border-cub-charcoal/80 bg-cub-ebony/50 px-2.5 py-2 transition hover:border-cub-gold/30 hover:bg-cub-charcoal/60"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="text-sm" aria-hidden>
                    {EARN_TYPE_EMOJI[row.earnType]}
                  </span>
                  <EarnTypeBadge earnType={row.earnType} size="sm" />
                  <span className="truncate text-xs text-cub-muted">{row.label}</span>
                </div>
                <span
                  className={cn(
                    "shrink-0 text-xs font-black",
                    row.highlight === "met"
                      ? "text-cub-green-light"
                      : row.highlight === "pending"
                        ? "text-cub-gold-light"
                        : "text-cub-off-white",
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
        eyebrow="📊 Scoreboard"
        title={sectionTitle}
        subtitle={sectionSubtitle}
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row) => (
          <Link key={row.earnType} href={row.href}>
            <div
              className={cn(
                "h-full space-y-2 rounded-2xl border-2 bg-gradient-to-br from-cub-charcoal/90 to-cub-ebony p-4 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg",
                row.highlight === "met" && "border-cub-green-bright/40",
                row.highlight === "pending" && "border-cub-gold/35",
                !row.highlight && "border-violet-500/20 hover:border-violet-400/35",
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl" aria-hidden>
                  {EARN_TYPE_EMOJI[row.earnType]}
                </span>
                <EarnTypeBadge earnType={row.earnType} />
              </div>
              <p className="text-sm text-cub-muted">{row.label}</p>
              <p className="text-lg font-black text-cub-off-white">{row.value}</p>
              {row.sub ? (
                <p className="text-xs text-cub-muted">{row.sub}</p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
