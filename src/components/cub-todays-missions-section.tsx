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
import {
  cubKidBadge,
  cubKidEmptyState,
  cubKidGameCard,
  KID_EARN_CARD,
} from "@/lib/cub-kid-theme";
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
  const kidCard = KID_EARN_CARD[mission.earnType];
  const statusCopy = getKidMissionStatusLabel(mission.statusLabel);

  return (
    <li className="min-w-0">
      <Link
        href={mission.href}
        aria-label={`${mission.title}. ${statusCopy}. ${flair.actionLabel}`}
        className={cn(
          "group flex aspect-square w-full flex-col rounded-2xl border-[3px] bg-gradient-to-br p-2.5 text-left",
          cubKidGameCard,
          kidCard.border,
          kidCard.accent,
          flair.glowClass,
          urgent && "ring-2 ring-kid-orange/50",
          showPulse && "animate-pulse",
        )}
      >
        <div className="flex items-start justify-between gap-1">
          <span
            className={cn(
              "flex h-5 min-w-5 items-center justify-center rounded-lg px-1 text-[10px] font-black ring-1",
              flair.indexClass,
            )}
          >
            {index + 1}
          </span>
          {urgent ? (
            <span className={cn(cubKidBadge, "px-1 py-0.5 text-[8px]")}>
              Go!
            </span>
          ) : (
            <span className="text-sm leading-none" aria-hidden>
              {flair.icon}
            </span>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col justify-center">
          <p
            className={cn(
              "line-clamp-3 font-black leading-snug text-kid-ink group-hover:text-kid-purple",
              compact ? "text-sm sm:text-base" : "text-base sm:text-lg",
            )}
          >
            {mission.title}
          </p>
        </div>

        <div className="mt-auto space-y-0.5 pt-1">
          <p className="truncate text-[10px] font-bold uppercase tracking-wide text-kid-ink-muted">
            {meta.shortLabel}
          </p>
          <p
            className={cn(
              "truncate font-black uppercase tracking-wide text-kid-purple group-hover:text-kid-pink",
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
        <div className={cubKidEmptyState}>
          <p className="text-2xl" aria-hidden>
            ✨
          </p>
          <p className="mt-2 text-sm font-black text-kid-ink">Board cleared!</p>
          <p className="mt-0.5 text-xs text-kid-ink-muted">
            No missions yet — your next quest will show up soon!
          </p>
        </div>
      ) : (
        <EmptyState
          title="Board cleared!"
          description="No missions yet — your next quest will show up soon! When your parent assigns new missions, they'll appear here."
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
      eyebrow="⚔️ Today's Missions"
      title="Active Missions"
      subtitle={!isCompact ? getQuestLogSubtitle(missions.length) : undefined}
      compact={isCompact}
      trailing={
        missions.length > 0 ? (
          <div className="flex items-center gap-1.5">
            <span className={cubKidBadge}>
              {missions.length}
            </span>
            {urgentCount > 0 ? (
              <span className="rounded-full bg-kid-orange/25 px-2 py-0.5 text-[10px] font-black text-orange-700">
                {urgentCount} to do
              </span>
            ) : (
              <span className="rounded-full bg-kid-green/25 px-2 py-0.5 text-[10px] font-black text-emerald-700">
                You&apos;re on a roll!
              </span>
            )}
          </div>
        ) : null
      }
    />
  );

  if (isCompact) {
    return (
      <CubKidPanel variant="sky" contentClassName="space-y-3">
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
