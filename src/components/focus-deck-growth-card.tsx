import { CubKidPanel } from "@/components/cub-kid/cub-kid-panel";
import type { FocusDeckGrowthSummary } from "@/lib/focus-deck-growth";
import {
  ALL_FOCUS_DECK_CATEGORIES,
  FOCUS_DECK_CATEGORY_LABELS,
} from "@/lib/focus-deck-categories";
import { KID_GROWTH_COLORS } from "@/lib/cub-kid-theme";
import { cn } from "@/lib/utils";

const AREA_COLORS = {
  MIND: "text-violet-300",
  BODY: "text-cub-off-white",
  CHARACTER: "text-cub-green-light",
  RESPONSIBILITY: "text-cub-gold-light",
  CREATIVITY: "text-cub-gold-warm",
  FAMILY: "text-amber-200",
  COMMUNITY: "text-cub-green-bright",
} as const;

type FocusDeckGrowthCardProps = {
  summary: FocusDeckGrowthSummary;
  className?: string;
};

export function FocusDeckGrowthCard({ summary, className }: FocusDeckGrowthCardProps) {
  const maxPoints = Math.max(
    1,
    ...ALL_FOCUS_DECK_CATEGORIES.map((area) => summary.byArea[area].points),
  );

  return (
    <CubKidPanel variant="gold" contentClassName="space-y-4">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cub-gold-light">
          🌱 Growth Chart
        </p>
        <h2 className="mt-1 text-lg font-black text-cub-off-white">Growth Picks points</h2>
        <p className="mt-1 text-sm text-cub-muted">
          {summary.weekLabel} · {summary.cardsCompleted} Growth Pick
          {summary.cardsCompleted === 1 ? "" : "s"} approved · {summary.totalPoints} area
          points across seven Cub Codes
        </p>
      </div>

      <ul className="space-y-3">
        {ALL_FOCUS_DECK_CATEGORIES.map((area) => {
          const stats = summary.byArea[area];
          const width = stats.points > 0 ? (stats.points / maxPoints) * 100 : 0;

          return (
            <li key={area}>
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className={cn("font-medium", AREA_COLORS[area])}>
                  {FOCUS_DECK_CATEGORY_LABELS[area]}
                </span>
                <span className="text-cub-muted">{stats.points} pts</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-cub-charcoal">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${width}%`,
                    background: `linear-gradient(to right, ${KID_GROWTH_COLORS[area]}, ${KID_GROWTH_COLORS[area]}cc)`,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </CubKidPanel>
  );
}
