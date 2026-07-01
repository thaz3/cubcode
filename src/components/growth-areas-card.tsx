import type { GrowthCategory } from "@/generated/prisma/client";
import Link from "next/link";
import { CubKidPanel } from "@/components/cub-kid/cub-kid-panel";
import { Card } from "@/components/ui/card";
import { cubSectionLabel, cubSectionTitle } from "@/lib/cub-theme";
import {
  KID_GROWTH_BG,
  KID_GROWTH_COLORS,
  KID_GROWTH_TEXT,
  cubKidSectionEyebrow,
  cubKidSectionTitle,
  cubKidTextMuted,
} from "@/lib/cub-kid-theme";
import {
  ALL_GROWTH_CATEGORIES,
  GROWTH_CATEGORY_LABELS,
  GROWTH_CATEGORY_TAGLINES,
  GROWTH_CATEGORY_FOCUS,
  growthCategoryShortLabel,
} from "@/lib/task-categories";
import type { GrowthAreaSummary } from "@/lib/growth-area-summary";
import { growthRingSweepPercent, GROWTH_RING_FULL_COMPLETIONS } from "@/lib/unified-growth-areas";
import { cubProgressPath } from "@/lib/cub-progress-paths";
import { cn } from "@/lib/utils";

const AREA_COLORS: Record<GrowthCategory, string> = {
  MIND: "text-violet-300",
  BODY: "text-cub-off-white",
  CHARACTER: "text-cub-green-bright",
  RESPONSIBILITY: "text-cub-gold-light",
  CREATIVITY: "text-cub-gold-warm",
  FAMILY: "text-amber-200",
  COMMUNITY: "text-cub-green-light",
};

const GROWTH_RING_COLORS: Record<GrowthCategory, string> = {
  MIND: "#a78bfa",
  BODY: "#f4f1ea",
  CHARACTER: "#6ee7b7",
  RESPONSIBILITY: "#d5a021",
  CREATIVITY: "#f2c14e",
  FAMILY: "#fbbf24",
  COMMUNITY: "#4ade80",
};

const GROWTH_FILL_COLORS: Record<GrowthCategory, string> = {
  MIND: "rgba(167, 139, 250, 0.35)",
  BODY: "rgba(244, 241, 234, 0.2)",
  CHARACTER: "rgba(110, 231, 183, 0.35)",
  RESPONSIBILITY: "rgba(213, 160, 33, 0.35)",
  CREATIVITY: "rgba(242, 193, 78, 0.35)",
  FAMILY: "rgba(251, 191, 36, 0.35)",
  COMMUNITY: "rgba(74, 222, 128, 0.35)",
};

const GROWTH_TRACK_COLOR = "#e8e4f0";
const GROWTH_GRID_COLOR = "#d4cfe8";

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
      ? "Tasks, routines, Focus Blocks, and Growth Picks — one chart across all seven Cub Codes."
      : "Evidence of work across all seven Cub Codes, including Growth Picks.";

  if (audience === "cub") {
    const activity = countAreasWithActivity(summary);
    return (
      <CubKidPanel variant="green" contentClassName="space-y-5">
        <div>
          <p className={cubKidSectionEyebrow}>📈 {summary.weekLabel}</p>
          <h2 className={cn("mt-1 text-lg", cubKidSectionTitle)}>{headline}</h2>
          <p className={cn("mt-2 text-sm", cubKidTextMuted)}>{subcopy}</p>
          <p className="mt-2 text-sm font-black text-emerald-600">
            {activity.active}/{activity.total} areas with activity ·{" "}
            {summary.totalPoints} total points
            {summary.growthPicksCompleted > 0
              ? ` · ${summary.growthPicksCompleted} Growth Pick${summary.growthPicksCompleted === 1 ? "" : "s"}`
              : ""}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <CoverageRings summary={summary} audience="cub" />
          <GrowthRadar summary={summary} audience="cub" />
        </div>

        <GrowthAreaDrillDown summary={summary} audience="cub" />

        <GrowthCodeGuide audience="cub" />
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

      <GrowthCodeGuide />
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
      <CubKidPanel variant="pink" contentClassName="space-y-3">
        <div>
          <p className={cubKidSectionEyebrow}>🌱 Growth this week</p>
          <p className={cn("mt-0.5 text-xs", cubKidTextMuted)}>{summary.weekLabel}</p>
        </div>

        <ul className="grid grid-cols-4 gap-1.5 sm:grid-cols-7">
          {ALL_GROWTH_CATEGORIES.map((area) => {
            const stats = summary.byArea[area];
            const filled = stats.completions > 0;
            return (
              <li
                key={area}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl border-2 px-1 py-2 text-center",
                  KID_GROWTH_BG[area],
                )}
                title={
                  filled
                    ? `${growthCategoryShortLabel(area)}: ${stats.points} point${stats.points === 1 ? "" : "s"}`
                    : `${growthCategoryShortLabel(area)}: no work yet`
                }
              >
                <CoverageRing
                  area={area}
                  filled={filled}
                  completions={stats.completions}
                  label={growthCategoryShortLabel(area)}
                  size="sm"
                  audience="cub"
                />
                <span
                  className={cn(
                    "text-[10px] font-black leading-tight",
                    KID_GROWTH_TEXT[area],
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
            className="block text-center text-xs font-black text-kid-purple hover:text-kid-pink"
          >
            Level up your growth →
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

      <ul className="grid grid-cols-4 gap-1.5 sm:grid-cols-7">
        {ALL_GROWTH_CATEGORIES.map((area) => {
          const stats = summary.byArea[area];
          const filled = stats.completions > 0;
          return (
            <li
              key={area}
              className="flex flex-col items-center gap-1 rounded-lg border border-cub-charcoal bg-cub-ebony/60 px-1 py-2 text-center"
              title={
                filled
                  ? `${growthCategoryShortLabel(area)}: ${stats.points} point${stats.points === 1 ? "" : "s"}`
                  : `${growthCategoryShortLabel(area)}: no work yet`
              }
            >
              <CoverageRing
                area={area}
                filled={filled}
                completions={stats.completions}
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

function CoverageRings({
  summary,
  audience = "parent",
}: {
  summary: GrowthAreaSummary;
  audience?: "parent" | "cub";
}) {
  const isCub = audience === "cub";
  return (
    <div className="space-y-3">
      <p
        className={cn(
          "text-xs font-bold uppercase tracking-wide",
          isCub ? cubKidSectionEyebrow : "text-cub-gold-light",
        )}
      >
        Coverage
      </p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-1">
        {ALL_GROWTH_CATEGORIES.map((area) => {
          const stats = summary.byArea[area];
          const filled = stats.completions > 0;
          return (
            <li
              key={area}
              className={cn(
                "flex items-center gap-3 rounded-2xl border-2 px-3 py-2.5",
                isCub
                  ? KID_GROWTH_BG[area]
                  : "border-cub-green/25 bg-cub-ebony/50",
              )}
            >
              <CoverageRing
                area={area}
                filled={filled}
                completions={stats.completions}
                label={growthCategoryShortLabel(area)}
                audience={audience}
              />
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-sm font-bold",
                    isCub ? KID_GROWTH_TEXT[area] : AREA_COLORS[area],
                  )}
                >
                  {growthCategoryShortLabel(area)}
                </p>
                <p className={cn("text-xs", isCub ? cubKidTextMuted : "text-cub-muted")}>
                  {filled
                    ? `${stats.points} point${stats.points === 1 ? "" : "s"}`
                    : "No activity yet"}
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
  completions = 0,
  label,
  size = "md",
  audience = "parent",
}: {
  area: GrowthCategory;
  filled: boolean;
  completions?: number;
  label: string;
  size?: "sm" | "md";
  audience?: "parent" | "cub";
}) {
  const dim = size === "sm" ? 32 : 48;
  const thickness = size === "sm" ? 4 : 5;
  const color =
    audience === "cub" ? KID_GROWTH_COLORS[area] : GROWTH_RING_COLORS[area];
  const sweep = growthRingSweepPercent(filled ? completions : 0);

  return (
    <div
      className="shrink-0 rounded-full"
      role="img"
      aria-label={`${label}: ${filled ? `${completions} of ${GROWTH_RING_FULL_COMPLETIONS} completions` : "no work yet"}`}
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

function GrowthRadar({
  summary,
  audience = "parent",
}: {
  summary: GrowthAreaSummary;
  audience?: "parent" | "cub";
}) {
  const isCub = audience === "cub";
  const chartSize = 220;
  const pad = 58;
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
      <p
        className={cn(
          "text-xs font-bold uppercase tracking-wide",
          isCub ? cubKidSectionEyebrow : "text-cub-gold-light",
        )}
      >
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
            const labelRadius = maxRadius + 24;
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
                    "fill-current text-[9px] font-semibold",
                    isCub ? KID_GROWTH_TEXT[area] : AREA_COLORS[area],
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
              fill="rgba(123, 92, 255, 0.2)"
              stroke="#7B5CFF"
              strokeWidth={2}
            />
          ) : null}
          {ALL_GROWTH_CATEGORIES.map((area) => {
            const p = pointFor(area, 1);
            const points = summary.byArea[area].points;
            const ringColor =
              audience === "cub" ? KID_GROWTH_COLORS[area] : GROWTH_RING_COLORS[area];
            const fillColor =
              audience === "cub"
                ? `${KID_GROWTH_COLORS[area]}55`
                : GROWTH_FILL_COLORS[area];
            return (
              <g key={`${area}-dot`}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={points > 0 ? 5 : 3}
                  fill={fillColor}
                  stroke={ringColor}
                  strokeWidth={2}
                />
              </g>
            );
          })}
        </svg>
        <p className={cn("mt-2 text-center text-xs", isCub ? cubKidTextMuted : "text-cub-muted")}>
          Points this week — tasks, routines, and Growth Picks combined · larger
          shape = more balanced growth
        </p>
      </div>
    </div>
  );
}

function GrowthAreaDrillDown({
  summary,
  audience = "parent",
}: {
  summary: GrowthAreaSummary;
  audience?: "parent" | "cub";
}) {
  const isCub = audience === "cub";
  const activeAreas = ALL_GROWTH_CATEGORIES.filter(
    (area) => summary.byArea[area].points > 0,
  );

  if (activeAreas.length === 0) {
    return (
      <p
        className={cn(
          "rounded-2xl border-2 border-dashed px-4 py-3 text-sm",
          isCub
            ? "border-kid-purple/25 bg-kid-lavender/50 text-kid-ink-muted"
            : "border-cub-gold/30 bg-cub-gold-muted/30 text-cub-muted",
        )}
      >
        No growth activity yet this week. Complete tasks, routines, Focus Blocks,
        or pick a Growth Pick card.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p
        className={cn(
          "text-xs font-bold uppercase tracking-wide",
          isCub ? cubKidSectionEyebrow : "text-cub-gold-light",
        )}
      >
        What counted
      </p>
      <ul className="space-y-3">
        {activeAreas.map((area) => {
          const stats = summary.byArea[area];
          return (
            <li
              key={area}
              className={cn(
                "rounded-2xl border-2 px-4 py-3",
                isCub ? KID_GROWTH_BG[area] : "border-cub-charcoal bg-cub-ebony/50",
              )}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className={cn("font-bold", isCub ? KID_GROWTH_TEXT[area] : AREA_COLORS[area])}>
                  {GROWTH_CATEGORY_LABELS[area]}
                </p>
                <p className={cn("text-xs", isCub ? cubKidTextMuted : "text-cub-muted")}>
                  {stats.points} point{stats.points === 1 ? "" : "s"}
                  {stats.xpEarned > 0 ? ` · ${stats.xpEarned} XP` : ""}
                </p>
              </div>
              <p className={cn("mt-1 text-xs leading-relaxed", isCub ? cubKidTextMuted : "text-cub-muted")}>
                {GROWTH_CATEGORY_TAGLINES[area]}
              </p>
              <ul className="mt-2 space-y-1">
                {stats.items.map((item) => (
                  <li
                    key={`${item.type}-${item.id}-${item.points ?? 0}`}
                    className={cn(
                      "flex items-center justify-between gap-2 text-sm",
                      isCub ? "text-kid-ink" : "text-cub-off-white/90",
                    )}
                  >
                    <span className="min-w-0 truncate">
                      <span className={isCub ? "text-kid-ink-muted" : "text-cub-muted"}>
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
                    <span className={cn("shrink-0 text-xs", isCub ? "text-kid-ink-muted" : "text-cub-muted")}>
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

function GrowthCodeGuide({ audience = "parent" }: { audience?: "parent" | "cub" }) {
  const isCub = audience === "cub";

  return (
    <div className="space-y-3">
      <div>
        <p
          className={cn(
            "text-xs font-bold uppercase tracking-wide",
            isCub ? cubKidSectionEyebrow : "text-cub-gold-light",
          )}
        >
          The Code
        </p>
        <p className={cn("mt-1 text-sm leading-relaxed", isCub ? cubKidTextMuted : "text-cub-muted")}>
          Seven areas for raising children with strong minds, disciplined bodies,
          creative spirits, good character, and responsibility to something bigger
          than themselves.
        </p>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {ALL_GROWTH_CATEGORIES.map((area) => (
          <li
            key={area}
            className={cn(
              "rounded-2xl border-2 px-3 py-2.5",
              isCub ? KID_GROWTH_BG[area] : "border-cub-charcoal bg-cub-ebony/40",
            )}
          >
            <p className={cn("text-sm font-bold", isCub ? KID_GROWTH_TEXT[area] : AREA_COLORS[area])}>
              {growthCategoryShortLabel(area)}
            </p>
            <p className={cn("mt-0.5 text-xs leading-relaxed", isCub ? cubKidTextMuted : "text-cub-muted")}>
              {GROWTH_CATEGORY_TAGLINES[area]}
            </p>
            <p className={cn("mt-1 text-[11px] leading-relaxed", isCub ? "text-kid-ink-soft" : "text-cub-off-white/70")}>
              {GROWTH_CATEGORY_FOCUS[area]}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
