import Link from "next/link";
import { CubKidPanel } from "@/components/cub-kid/cub-kid-panel";
import { CubKidSectionHeader } from "@/components/cub-kid/cub-kid-section-header";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getKidMissionStatusLabel,
  getQuestLogSubtitle,
  MISSION_FLAIR,
} from "@/lib/active-mission-flair";
import type { ActiveMission } from "@/lib/cub-week-earn-summary";
import { getEarnTypeMeta } from "@/lib/earn-types";
import { cubKidGameCard } from "@/lib/cub-kid-theme";
import { cn } from "@/lib/utils";

type CubTodaysMissionsSectionProps = {
  missions: ActiveMission[];
  variant?: "default" | "compact";
};

function isUrgentMission(mission: ActiveMission): boolean {
  const status = mission.statusLabel?.toLowerCase() ?? "";
  return (
    status.includes("due today") ||
    status.includes("ready to pick") ||
    status.includes("sent back") ||
    status === "in progress"
  );
}

function ActiveMissionButton({
  mission,
  index,
  compact,
  urgent,
  showPulse,
}: {
  mission: ActiveMission;
  index: number;
  compact: boolean;
  urgent: boolean;
  showPulse: boolean;
}) {
  const meta = getEarnTypeMeta(mission.earnType);
  const flair = MISSION_FLAIR[mission.earnType];
  const statusCopy = getKidMissionStatusLabel(mission.statusLabel);

  return (
    <li className="min-w-0">
      <Link
        href={mission.href}
        aria-label={`${mission.title}. ${statusCopy}. ${flair.actionLabel}`}
        className={cn(
          "group flex aspect-square w-full flex-col rounded-xl border bg-gradient-to-br p-2.5 text-left",
          cubKidGameCard,
          "hover:border-cub-gold/45 hover:shadow-cub-gold/10",
          "active:translate-y-0 active:scale-[0.98]",
          meta.cardBorderClass,
          meta.cardAccentClass,
          urgent && "ring-1 ring-cub-gold/35",
          showPulse && "animate-pulse",
        )}
      >
        <div className="flex items-start justify-between gap-1">
          <span
            className={cn(
              "flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-[10px] font-bold ring-1",
              flair.indexClass,
            )}
          >
            {index + 1}
          </span>
          {urgent ? (
            <span className="rounded-full bg-cub-gold-muted px-1 py-0.5 text-[8px] font-bold uppercase text-cub-gold-light">
              Go
            </span>
          ) : (
            <span className="text-sm leading-none opacity-80" aria-hidden>
              {flair.icon}
            </span>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col justify-center">
          <p
            className={cn(
              "line-clamp-3 font-bold leading-snug text-cub-off-white group-hover:text-cub-gold-light",
              compact ? "text-sm sm:text-base" : "text-base sm:text-lg",
            )}
          >
            {mission.title}
          </p>
        </div>

        <div className="mt-auto space-y-0.5 pt-1">
          <p className="truncate text-[10px] font-bold uppercase tracking-wide text-cub-muted">
            {meta.shortLabel}
          </p>
          <p
            className={cn(
              "truncate font-bold uppercase tracking-wide text-cub-gold-light group-hover:text-cub-gold-warm",
              compact ? "text-xs" : "text-sm",
            )}
          >
            {flair.actionLabel} →
          </p>
        </div>
      </Link>
    </li>
  );
}

export function CubTodaysMissionsSection({
  missions,
  variant = "default",
}: CubTodaysMissionsSectionProps) {
  const isCompact = variant === "compact";
  const urgentCount = missions.filter(isUrgentMission).length;

  const content =
    missions.length === 0 ? (
      isCompact ? (
        <div className="col-span-full rounded-xl border border-dashed border-cub-green/25 bg-cub-green-muted/15 px-3 py-6 text-center">
          <p className="text-sm font-semibold text-cub-off-white">Board cleared!</p>
          <p className="mt-0.5 text-[10px] text-cub-muted">No quests right now.</p>
        </div>
      ) : (
        <EmptyState
          title="Board cleared!"
          description="No quests on your log right now. When your parent assigns new missions, they'll show up here."
        />
      )
    ) : (
      <ul
        className={cn(
          "grid w-full gap-2",
          isCompact
            ? "grid-cols-3 sm:grid-cols-4"
            : "grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5",
        )}
      >
        {missions.map((mission, index) => {
          const urgent = isUrgentMission(mission);
          const firstUrgentIndex = missions.findIndex(isUrgentMission);
          const showPulse = urgent && index === firstUrgentIndex;

          return (
            <ActiveMissionButton
              key={mission.id}
              mission={mission}
              index={index}
              compact={isCompact}
              urgent={urgent}
              showPulse={showPulse}
            />
          );
        })}
      </ul>
    );

  const header = (
    <CubKidSectionHeader
      eyebrow="🗺️ Quest log"
      title="Active Missions"
      subtitle={!isCompact ? getQuestLogSubtitle(missions.length) : undefined}
      compact={isCompact}
      trailing={
        missions.length > 0 ? (
          <div className="flex items-center gap-1.5">
            <span className="rounded-lg border border-cub-gold/30 bg-cub-gold-muted/30 px-2 py-0.5 text-xs font-black text-cub-gold-warm">
              {missions.length}
            </span>
            {urgentCount > 0 ? (
              <span className="rounded-lg bg-cub-gold/15 px-1.5 py-0.5 text-[10px] font-bold text-cub-gold-light">
                {urgentCount} to do
              </span>
            ) : null}
          </div>
        ) : null
      }
    />
  );

  if (isCompact) {
    return (
      <CubKidPanel variant="violet" contentClassName="space-y-3">
        {header}
        {content}
      </CubKidPanel>
    );
  }

  return (
    <section className="space-y-3">
      {header}
      {content}
    </section>
  );
}
