import type { GrowthCategory } from "@/generated/prisma/client";
import Link from "next/link";
import { CubKidPanel } from "@/components/cub-kid/cub-kid-panel";
import { Card } from "@/components/ui/card";
import { cubSectionLabel, cubSectionTitle } from "@/lib/cub-theme";
import {
  ALL_GROWTH_CATEGORIES,
  GROWTH_CATEGORY_LABELS,
  growthCategoryShortLabel,
} from "@/lib/task-categories";
import type { GrowthAreaSummary } from "@/lib/growth-area-summary";
import { cubProgressPath } from "@/lib/cub-progress-paths";
import { cn } from "@/lib/utils";

const AREA_COLORS: Record<GrowthCategory, string> = {
  CHARACTER: "text-cub-green-bright",
  WELLNESS: "text-cub-off-white",
  CREATIVITY: "text-cub-gold-warm",
  RESPONSIBILITY: "text-cub-gold-light",
  COMMUNITY: "text-cub-green-light",
};

const GROWTH_RING_COLORS: Record<GrowthCategory, string> = {
  CHARACTER: "#6ee7b7",
  WELLNESS: "#f4f1ea",
  CREATIVITY: "#f2c14e",
  RESPONSIBILITY: "#d5a021",
  COMMUNITY: "#4ade80",
};

const GROWTH_FILL_COLORS: Record<GrowthCategory, string> = {
  CHARACTER: "rgba(110, 231, 183, 0.35)",
  WELLNESS: "rgba(244, 241, 234, 0.2)",
  CREATIVITY: "rgba(242, 193, 78, 0.35)",
  RESPONSIBILITY: "rgba(213, 160, 33, 0.35)",
  COMMUNITY: "rgba(74, 222, 128, 0.35)",
};

const GROWTH_TRACK_COLOR = "#78716c";
const GROWTH_GRID_COLOR = "#57534e";

function radarLabelAnchor(angle: number): "start" | "middle" | "end" {
  const x = Math.cos(angle);
  if (x > 0.2) return "start";
  if (x < -0.2) return "end";
  return "middle";
}

function countAreasWithActivity(summary: GrowthAreaSummary): {
  active: number;
  total: number;
} {
  const active = ALL_GROWTH_CATEGORIES.filter(
    (area) => summary.byArea[area].points > 0,
  ).length;
  return { active, total: ALL_GROWTH_CATEGORIES.length };
}

type GrowthAreasCardProps = {
  summary: GrowthAreaSummary;
  cubName?: string;
  cubId?: string;
  audience?: "parent" | "cub";
  variant?: "full" | "mini";
  className?: string;
};

export function GrowthAreasCard({
  summary,
  cubName,
  cubId,
  audience = "parent",
  variant = "full",
  className,
}: GrowthAreasCardProps) {
  if (variant === "mini") {
    return (
      <GrowthAreasMiniCard
        summary={summary}
        cubName={cubName}
        cubId={cubId}
        audience={audience}
        className={className}
      />
    );
  }

  const headline =
    audience === "cub"
      ? "Your growth this week"
      : cubName
        ? `${cubName}'s growth areas`
        : "Growth areas";

  const subcopy =
    audience === "cub"
      ? "Tasks, routines, Focus Blocks, and Growth Picks — one chart for your whole week."
      : "Evidence of work across all five growth areas, including Growth Picks.";

  if (audience === "cub") {
    const activity = countAreasWithActivity(summary);
    return (
      <CubKidPanel variant="violet" contentClassName="space-y-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cub-gold-light">
            📈 {summary.weekLabel}
          </p>
          <h2 className="mt-1 text-lg font-black text-cub-off-white">{headline}</h2>
          <p className="mt-2 text-sm text-cub-muted">{subcopy}</p>
          <p className="mt-2 text-sm font-bold text-cub-green-light">
            {activity.active}/{activity.total} areas with activity ·{" "}
            {summary.totalPoints} total points
            {summary.growthPicksCompleted > 0
              ? ` · ${summary.growthPicksCompleted} Growth Pick${summary.growthPicksCompleted === 1 ? "" : "s"}`
              : ""}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <CoverageRings summary={summary} />
          <GrowthRadar summary={summary} />
        </div>

        <GrowthAreaDrillDown summary={summary} />
      </CubKidPanel>
    );
  }

  return (
    <Card variant="constructive" className={cn("space-y-5", className)}>
      <div>
        <p className={cubSectionLabel}>{summary.weekLabel}</p>
        <h2 className={cn("mt-1", cubSectionTitle)}>{headline}</h2>
        <p className="mt-2 text-sm text-cub-muted">{subcopy}</p>
        {(() => {
          const activity = countAreasWithActivity(summary);
          return (
        <p className="mt-2 text-sm font-medium text-cub-green-light">
          {activity.active}/{activity.total} areas with activity ·{" "}
          {summary.totalPoints} total points
        </p>
          );
        })()}
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <CoverageRings summary={summary} />
        <GrowthRadar summary={summary} />
      </div>

      <GrowthAreaDrillDown summary={summary} />
    </Card>
  );
}

type GrowthAreasMiniCardProps = {
  summary: GrowthAreaSummary;
  cubName?: string;
  cubId?: string;
  audience?: "parent" | "cub";
  className?: string;
};

function GrowthAreasMiniCard({
  summary,
  cubName,
  cubId,
  audience = "parent",
  className,
}: GrowthAreasMiniCardProps) {
  const progressHref = cubId
    ? audience === "cub"
      ? cubProgressPath(cubId)
      : `/dashboard/cubs/${cubId}/progress`
    : undefined;

  if (audience === "cub") {
    return (
      <CubKidPanel variant="violet" contentClassName="space-y-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cub-gold-light">
            🌱 Growth this week
          </p>
          <p className="mt-0.5 text-xs text-cub-muted">{summary.weekLabel}</p>
        </div>

        <ul className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
          {ALL_GROWTH_CATEGORIES.map((area) => {
            const filled = summary.byArea[area].points > 0;
            const count = summary.byArea[area].points;
            return (
              <li
                key={area}
                className="flex flex-col items-center gap-1 rounded-xl border border-violet-500/20 bg-cub-ebony/60 px-1 py-2 text-center"
                title={
                  filled
                    ? `${growthCategoryShortLabel(area)}: ${count} point${count === 1 ? "" : "s"}`
                    : `${growthCategoryShortLabel(area)}: no work yet`
                }
              >
                <CoverageRing
                  area={area}
                  filled={filled}
                  points={count}
                  label={growthCategoryShortLabel(area)}
                  size="sm"
                />
                <span
                  className={cn(
                    "text-[10px] font-bold leading-tight",
                    AREA_COLORS[area],
                  )}
                >
                  {growthCategoryShortLabel(area)}
                </span>
              </li>
            );
          })}
        </ul>

        {progressHref ? (
          <Link
            href={progressHref}
            className="block text-center text-xs font-bold text-cub-gold-light hover:text-cub-gold-warm"
          >
            View full growth →
          </Link>
        ) : null}
      </CubKidPanel>
    );
  }

  return (
    <Card
      variant="constructive"
      className={cn("flex flex-col gap-3 p-4", className)}
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-cub-gold-light">
          Growth this week
        </p>
        <p className="mt-0.5 text-sm text-cub-muted">{summary.weekLabel}</p>
      </div>

      <ul className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
        {ALL_GROWTH_CATEGORIES.map((area) => {
          const filled = summary.byArea[area].points > 0;
          const count = summary.byArea[area].points;
          return (
            <li
              key={area}
              className="flex flex-col items-center gap-1 rounded-lg border border-cub-charcoal bg-cub-ebony/60 px-1 py-2 text-center"
              title={
                filled
                  ? `${growthCategoryShortLabel(area)}: ${count} point${count === 1 ? "" : "s"}`
                  : `${growthCategoryShortLabel(area)}: no work yet`
              }
            >
              <CoverageRing
                area={area}
                filled={filled}
                points={count}
                label={growthCategoryShortLabel(area)}
                size="sm"
              />
              <span
                className={cn(
                  "text-[10px] font-semibold leading-tight",
                  AREA_COLORS[area],
                )}
              >
                {growthCategoryShortLabel(area)}
              </span>
            </li>
          );
        })}
      </ul>

      {progressHref ? (
        <Link
          href={progressHref}
          className="text-center text-xs font-medium text-cub-gold-light hover:text-cub-gold-warm"
        >
          View full growth →
        </Link>
      ) : null}
    </Card>
  );
}

function CoverageRings({ summary }: { summary: GrowthAreaSummary }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-wide text-cub-gold-light">
        Coverage
      </p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-1">
        {ALL_GROWTH_CATEGORIES.map((area) => {
          const stats = summary.byArea[area];
          const filled = stats.points > 0;
          return (
            <li
              key={area}
              className="flex items-center gap-3 rounded-xl border border-cub-green/25 bg-cub-ebony/50 px-3 py-2.5"
            >
              <CoverageRing
                area={area}
                filled={filled}
                points={stats.points}
                label={growthCategoryShortLabel(area)}
              />
              <div className="min-w-0">
                <p className={cn("text-sm font-semibold", AREA_COLORS[area])}>
                  {growthCategoryShortLabel(area)}
                </p>
                <p className="text-xs text-cub-muted">
                  {filled ? `${stats.points} point${stats.points === 1 ? "" : "s"}` : "No activity yet"}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function CoverageRing({
  area,
  filled,
  points = 0,
  label,
  size = "md",
}: {
  area: GrowthCategory;
  filled: boolean;
  points?: number;
  label: string;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? 32 : 48;
  const thickness = size === "sm" ? 4 : 5;
  const color = GROWTH_RING_COLORS[area];
  const sweep = filled ? Math.min(100, Math.max(30, (points / 5) * 100)) : 18;

  return (
    <div
      className="shrink-0 rounded-full"
      role="img"
      aria-label={`${label}: ${filled ? "work shown" : "no work yet"}`}
      style={{
        width: dim,
        height: dim,
        background: `conic-gradient(from -90deg, ${color} 0deg, ${color} ${sweep * 3.6}deg, ${GROWTH_TRACK_COLOR} ${sweep * 3.6}deg, ${GROWTH_TRACK_COLOR} 360deg)`,
        WebkitMaskImage: `radial-gradient(farthest-side, transparent calc(100% - ${thickness}px), #000 calc(100% - ${thickness}px))`,
        maskImage: `radial-gradient(farthest-side, transparent calc(100% - ${thickness}px), #000 calc(100% - ${thickness}px))`,
      }}
    />
  );
}

function GrowthRadar({ summary }: { summary: GrowthAreaSummary }) {
  const chartSize = 220;
  const pad = 52;
  const size = chartSize + pad * 2;
  const center = pad + chartSize / 2;
  const maxRadius = chartSize / 2 - 28;
  const angles = ALL_GROWTH_CATEGORIES.map(
    (_, index) => -Math.PI / 2 + (index * 2 * Math.PI) / ALL_GROWTH_CATEGORIES.length,
  );

  function pointFor(area: GrowthCategory, scale: number) {
    const index = ALL_GROWTH_CATEGORIES.indexOf(area);
    const angle = angles[index]!;
    const value = summary.byArea[area].points;
    const radius = (value / summary.maxPoints) * maxRadius * scale;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  }

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const dataPoints = ALL_GROWTH_CATEGORIES.map((area) => pointFor(area, 1));
  const polygon = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-wide text-cub-gold-light">
        Balance
      </p>
      <div className="mx-auto w-full max-w-xs">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full"
          role="img"
          aria-label="Growth balance chart by points this week"
        >
          {gridLevels.map((level) => {
            const ring = ALL_GROWTH_CATEGORIES.map((area) => {
              const p = pointFor(area, level);
              return `${p.x},${p.y}`;
            }).join(" ");
            return (
              <polygon
                key={level}
                points={ring}
                fill="none"
                stroke={GROWTH_GRID_COLOR}
                strokeWidth={1}
              />
            );
          })}

          {ALL_GROWTH_CATEGORIES.map((area, index) => {
            const outer = pointFor(area, 1);
            const angle = angles[index]!;
            const labelRadius = maxRadius + 22;
            const lx = center + labelRadius * Math.cos(angle);
            const ly = center + labelRadius * Math.sin(angle);
            const anchor = radarLabelAnchor(angle);
            return (
              <g key={area}>
                <line
                  x1={center}
                  y1={center}
                  x2={outer.x}
                  y2={outer.y}
                  stroke={GROWTH_GRID_COLOR}
                  strokeWidth={1}
                />
                <text
                  x={lx}
                  y={ly}
                  textAnchor={anchor}
                  dominantBaseline="middle"
                  className={cn(
                    "fill-current text-[10px] font-semibold",
                    AREA_COLORS[area],
                  )}
                >
                  {growthCategoryShortLabel(area)}
                </text>
              </g>
            );
          })}

          {summary.totalPoints > 0 ? (
            <polygon
              points={polygon}
              fill="rgba(213, 160, 33, 0.25)"
              stroke="#f2c14e"
              strokeWidth={2}
            />
          ) : null}
          {ALL_GROWTH_CATEGORIES.map((area) => {
            const p = pointFor(area, 1);
            const points = summary.byArea[area].points;
            return (
              <g key={`${area}-dot`}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={points > 0 ? 5 : 3}
                  fill={GROWTH_FILL_COLORS[area]}
                  stroke={GROWTH_RING_COLORS[area]}
                  strokeWidth={2}
                />
              </g>
            );
          })}
        </svg>
        <p className="mt-2 text-center text-xs text-cub-muted">
          Points this week — tasks, routines, and Growth Picks combined · larger
          shape = more balanced growth
        </p>
      </div>
    </div>
  );
}

function GrowthAreaDrillDown({ summary }: { summary: GrowthAreaSummary }) {
  const activeAreas = ALL_GROWTH_CATEGORIES.filter(
    (area) => summary.byArea[area].points > 0,
  );

  if (activeAreas.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-cub-gold/30 bg-cub-gold-muted/30 px-4 py-3 text-sm text-cub-muted">
        No growth activity yet this week. Complete tasks, routines, Focus Blocks,
        or pick a Growth Pick card.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-wide text-cub-gold-light">
        What counted
      </p>
      <ul className="space-y-3">
        {activeAreas.map((area) => {
          const stats = summary.byArea[area];
          return (
            <li
              key={area}
              className="rounded-xl border border-cub-charcoal bg-cub-ebony/50 px-4 py-3"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className={cn("font-semibold", AREA_COLORS[area])}>
                  {GROWTH_CATEGORY_LABELS[area]}
                </p>
                <p className="text-xs text-cub-muted">
                  {stats.points} point{stats.points === 1 ? "" : "s"}
                  {stats.xpEarned > 0 ? ` · ${stats.xpEarned} XP` : ""}
                </p>
              </div>
              <ul className="mt-2 space-y-1">
                {stats.items.map((item) => (
                  <li
                    key={`${item.type}-${item.id}-${item.points ?? 0}`}
                    className="flex items-center justify-between gap-2 text-sm text-cub-off-white/90"
                  >
                    <span className="min-w-0 truncate">
                      <span className="text-cub-muted">
                        {item.type === "routine"
                          ? "Routine"
                          : item.type === "bonus"
                            ? "Parent bonus"
                            : item.type === "growth_pick"
                              ? "Growth Pick"
                              : "Task"}{" "}
                        ·{" "}
                      </span>
                      {item.title}
                    </span>
                    <span className="shrink-0 text-xs text-cub-muted">
                      {item.type === "growth_pick" && item.points
                        ? `+${item.points} pts`
                        : item.completedAt.toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
