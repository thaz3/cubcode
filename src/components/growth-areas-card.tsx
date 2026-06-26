import type { GrowthCategory } from "@/generated/prisma/client";
import Link from "next/link";
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
  CONTROL: "text-cub-green-light",
  USE: "text-cub-gold-light",
  BUILD: "text-cub-gold-warm",
  CHARACTER: "text-cub-green-bright",
  WELLNESS: "text-cub-off-white",
};

const AREA_RING: Record<GrowthCategory, string> = {
  CONTROL: "stroke-cub-green-bright",
  USE: "stroke-cub-gold",
  BUILD: "stroke-cub-gold-warm",
  CHARACTER: "stroke-cub-green-light",
  WELLNESS: "stroke-cub-off-white",
};

const AREA_FILL: Record<GrowthCategory, string> = {
  CONTROL: "fill-cub-green-bright/35",
  USE: "fill-cub-gold/35",
  BUILD: "fill-cub-gold-warm/35",
  CHARACTER: "fill-cub-green-light/30",
  WELLNESS: "fill-cub-off-white/20",
};

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
      ? "Work you showed in each area — tasks, focus sessions, and tagged routines."
      : "Evidence of work across required areas. Focus Block picking is separate from this wider picture.";

  return (
    <Card variant="constructive" className={cn("space-y-5", className)}>
      <div>
        <p className={cubSectionLabel}>{summary.weekLabel}</p>
        <h2 className={cn("mt-1", cubSectionTitle)}>{headline}</h2>
        <p className="mt-2 text-sm text-cub-muted">{subcopy}</p>
        <p className="mt-2 text-sm font-medium text-cub-green-light">
          {summary.coverage.met}/{summary.coverage.total} required areas with
          work this week
        </p>
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
        {summary.required.map((area) => {
          const filled = summary.byArea[area].completions > 0;
          const count = summary.byArea[area].completions;
          return (
            <li
              key={area}
              className="flex flex-col items-center gap-1 rounded-lg border border-cub-charcoal bg-cub-ebony/60 px-1 py-2 text-center"
              title={
                filled
                  ? `${growthCategoryShortLabel(area)}: ${count} completion${count === 1 ? "" : "s"}`
                  : `${growthCategoryShortLabel(area)}: no work yet`
              }
            >
              <CoverageRing
                filled={filled}
                strokeClass={AREA_RING[area]}
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
        {summary.required.map((area) => {
          const stats = summary.byArea[area];
          const filled = stats.completions > 0;
          return (
            <li
              key={area}
              className="flex items-center gap-3 rounded-xl border border-cub-green/25 bg-cub-ebony/50 px-3 py-2.5"
            >
              <CoverageRing
                filled={filled}
                strokeClass={AREA_RING[area]}
                label={growthCategoryShortLabel(area)}
              />
              <div className="min-w-0">
                <p className={cn("text-sm font-semibold", AREA_COLORS[area])}>
                  {growthCategoryShortLabel(area)}
                </p>
                <p className="text-xs text-cub-muted">
                  {filled
                    ? `${stats.completions} completion${stats.completions === 1 ? "" : "s"}`
                    : "No work yet"}
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
  filled,
  strokeClass,
  label,
  size = "md",
}: {
  filled: boolean;
  strokeClass: string;
  label: string;
  size?: "sm" | "md";
}) {
  const radius = size === "sm" ? 12 : 18;
  const dimension = size === "sm" ? 28 : 44;
  const strokeWidth = size === "sm" ? 3 : 4;
  const circumference = 2 * Math.PI * radius;
  const dash = filled ? circumference : circumference * 0.2;
  const center = dimension / 2;

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox={`0 0 ${dimension} ${dimension}`}
      className="shrink-0"
      aria-hidden
    >
      <title>{`${label}: ${filled ? "work shown" : "no work yet"}`}</title>
      <circle
        cx={center}
        cy={center}
        r={radius}
        className="stroke-cub-charcoal"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle
        cx={center}
        cy={center}
        r={radius}
        className={cn(strokeClass, filled ? "opacity-100" : "opacity-35")}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference}`}
        transform={`rotate(-90 ${center} ${center})`}
      />
    </svg>
  );
}

function GrowthRadar({ summary }: { summary: GrowthAreaSummary }) {
  const size = 260;
  const center = size / 2;
  const maxRadius = center - 36;
  const angles = ALL_GROWTH_CATEGORIES.map(
    (_, index) => -Math.PI / 2 + (index * 2 * Math.PI) / ALL_GROWTH_CATEGORIES.length,
  );

  function pointFor(area: GrowthCategory, scale: number) {
    const index = ALL_GROWTH_CATEGORIES.indexOf(area);
    const angle = angles[index]!;
    const value = summary.byArea[area].completions;
    const radius = (value / summary.maxCompletions) * maxRadius * scale;
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
          aria-label="Growth area balance chart by completion count"
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
                className="fill-none stroke-cub-charcoal"
                strokeWidth="1"
              />
            );
          })}

          {ALL_GROWTH_CATEGORIES.map((area, index) => {
            const outer = pointFor(area, 1);
            const angle = angles[index]!;
            const labelRadius = maxRadius + 22;
            const lx = center + labelRadius * Math.cos(angle);
            const ly = center + labelRadius * Math.sin(angle);
            return (
              <g key={area}>
                <line
                  x1={center}
                  y1={center}
                  x2={outer.x}
                  y2={outer.y}
                  className="stroke-cub-charcoal"
                  strokeWidth="1"
                />
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
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

          <polygon
            points={polygon}
            className="fill-cub-green-bright/25 stroke-cub-green-light"
            strokeWidth="2"
          />
          {ALL_GROWTH_CATEGORIES.map((area) => {
            const p = pointFor(area, 1);
            const count = summary.byArea[area].completions;
            return (
              <g key={`${area}-dot`}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={count > 0 ? 5 : 3}
                  className={cn(AREA_FILL[area], AREA_RING[area])}
                  strokeWidth="2"
                />
              </g>
            );
          })}
        </svg>
        <p className="mt-2 text-center text-xs text-cub-muted">
          Completion counts this week · larger shape = more balanced activity
        </p>
      </div>
    </div>
  );
}

function GrowthAreaDrillDown({ summary }: { summary: GrowthAreaSummary }) {
  const activeAreas = ALL_GROWTH_CATEGORIES.filter(
    (area) => summary.byArea[area].completions > 0,
  );

  if (activeAreas.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-cub-gold/30 bg-cub-gold-muted/30 px-4 py-3 text-sm text-cub-muted">
        No tagged work yet this week. Add a growth area when creating chores or
        routines, or complete a Focus Block session.
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
                  {stats.completions} completion
                  {stats.completions === 1 ? "" : "s"}
                  {stats.xpEarned > 0 ? ` · ${stats.xpEarned} XP` : ""}
                </p>
              </div>
              <ul className="mt-2 space-y-1">
                {stats.items.map((item) => (
                  <li
                    key={`${item.type}-${item.id}`}
                    className="flex items-center justify-between gap-2 text-sm text-cub-off-white/90"
                  >
                    <span className="min-w-0 truncate">
                      <span className="text-cub-muted">
                        {item.type === "routine"
                          ? "Routine"
                          : item.type === "bonus"
                            ? "Parent bonus"
                            : "Task"}{" "}
                        ·{" "}
                      </span>
                      {item.title}
                    </span>
                    <span className="shrink-0 text-xs text-cub-muted">
                      {item.completedAt.toLocaleDateString()}
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
