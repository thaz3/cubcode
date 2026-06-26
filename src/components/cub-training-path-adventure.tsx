"use client";

import Link from "next/link";
import { CubKidPanel } from "@/components/cub-kid/cub-kid-panel";
import { CubKidStatBar } from "@/components/cub-kid/cub-kid-stat-bar";
import type { CubTrainingBoardSummary } from "@/lib/cub-training-board-summary";
import type { TrainingDeckBoardStatus } from "@/lib/training-board-progress";
import { cn } from "@/lib/utils";

type CubTrainingPathAdventureProps = {
  summary: CubTrainingBoardSummary;
  deckBasePath: string;
  cubXp: number;
};

function LessonStars({
  approved,
  total,
  locked,
  size = "md",
}: {
  approved: number;
  total: number;
  locked: boolean;
  size?: "sm" | "md";
}) {
  const count = Math.min(Math.max(total, 1), 6);

  return (
    <div className="flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: count }).map((_, index) => (
        <span
          key={index}
          className={cn(
            "leading-none",
            size === "sm" ? "text-xs" : "text-base",
            locked
              ? "text-zinc-600"
              : index < approved
                ? "text-cub-gold-warm drop-shadow-[0_0_4px_rgba(242,193,78,0.5)]"
                : "text-zinc-600",
          )}
        >
          {index < approved ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
}

function LevelShield({
  level,
  status,
  large,
}: {
  level: number;
  status: TrainingDeckBoardStatus;
  large?: boolean;
}) {
  const isLocked = status === "LOCKED";
  const isComplete = status === "COMPLETE";

  return (
    <div
      className={cn(
        "flex shrink-0 flex-col items-center justify-center rounded-2xl border-b-[4px] font-black",
        large ? "h-14 w-14 sm:h-16 sm:w-16" : "h-11 w-11",
        isLocked
          ? "border-zinc-700 border-b-zinc-900 bg-gradient-to-b from-zinc-700 to-zinc-900 text-zinc-500"
          : isComplete
            ? "border-emerald-900 border-b-emerald-950 bg-gradient-to-b from-cub-green-bright to-emerald-700 text-white shadow-md shadow-cub-green/30"
            : "border-violet-900 border-b-violet-950 bg-gradient-to-b from-violet-400 to-violet-700 text-white shadow-lg shadow-violet-500/40",
      )}
    >
      {isLocked ? (
        <span className={large ? "text-lg" : "text-sm"}>🔒</span>
      ) : isComplete ? (
        <span className={large ? "text-xl" : "text-base"}>✓</span>
      ) : (
        <>
          <span className={cn("uppercase opacity-80", large ? "text-[9px]" : "text-[7px]")}>
            Lvl
          </span>
          <span className={cn("leading-none", large ? "text-xl" : "text-base")}>{level}</span>
        </>
      )}
    </div>
  );
}

function PathConnector({ locked }: { locked: boolean }) {
  return (
    <div className="relative flex h-8 items-center justify-center" aria-hidden>
      <div
        className={cn(
          "absolute left-1/2 h-full w-1 -translate-x-1/2 rounded-full",
          locked
            ? "bg-zinc-800"
            : "bg-gradient-to-b from-violet-500/80 to-violet-400/40 shadow-[0_0_8px_rgba(139,92,246,0.4)]",
        )}
      />
      {locked ? (
        <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-xs ring-1 ring-zinc-700">
          🔒
        </span>
      ) : null}
    </div>
  );
}

function FeaturedLevelCard({
  milestone,
  href,
}: {
  milestone: CubTrainingBoardSummary["milestones"][number];
  href: string;
}) {
  const progressPct =
    milestone.totalCards > 0
      ? Math.round((milestone.approvedCount / milestone.totalCards) * 100)
      : 0;
  const isComplete = milestone.status === "COMPLETE";

  return (
    <Link href={href} className="group block">
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border-2 p-4 shadow-xl transition-transform group-hover:scale-[1.01]",
          isComplete
            ? "border-cub-green-bright/50 bg-gradient-to-br from-emerald-950/60 via-cub-charcoal to-cub-ebony shadow-cub-green/20"
            : "border-violet-400/60 bg-gradient-to-br from-violet-950/50 via-cub-charcoal to-cub-ebony shadow-violet-500/30 ring-2 ring-violet-400/20",
        )}
      >
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-violet-500/20 blur-2xl"
          aria-hidden
        />

        <div className="relative flex gap-3">
          <LevelShield
            level={milestone.milestoneNumber}
            status={milestone.status}
            large
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-cub-off-white group-hover:text-cub-gold-light">
              {milestone.title}
            </h3>
            <div className="mt-1.5">
              <LessonStars
                approved={milestone.approvedCount}
                total={milestone.totalCards}
                locked={false}
              />
            </div>
            <p className="mt-1.5 text-xs text-cub-muted">
              {milestone.approvedCount}/{milestone.totalCards} lessons complete
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-cub-ebony">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  isComplete ? "bg-cub-green-bright" : "bg-gradient-to-r from-violet-500 to-sky-400",
                )}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="mt-3">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-xl px-5 py-2 text-sm font-bold uppercase tracking-wide shadow-md",
                  isComplete
                    ? "bg-cub-green-muted text-cub-green-light ring-1 ring-cub-green-bright/40"
                    : "bg-sky-500 text-white shadow-sky-500/40 group-hover:bg-sky-400",
                )}
              >
                {isComplete ? "Replay" : "Play"} <span aria-hidden>▶</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function LockedLevelCard({
  milestone,
  side,
}: {
  milestone: CubTrainingBoardSummary["milestones"][number];
  side: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "flex w-[88%] items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2.5 opacity-80",
        side === "left" ? "mr-auto" : "ml-auto flex-row-reverse text-right",
      )}
    >
      <LevelShield level={milestone.milestoneNumber} status="LOCKED" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-zinc-500">{milestone.title}</p>
        <LessonStars approved={0} total={milestone.totalCards} locked size="sm" />
        <p className="mt-1 text-[10px] text-zinc-600">
          Complete the previous level to unlock
        </p>
      </div>
      <span className="shrink-0 text-base text-zinc-600" aria-hidden>
        🔒
      </span>
    </div>
  );
}

function CompleteLevelCard({
  milestone,
  href,
  side,
}: {
  milestone: CubTrainingBoardSummary["milestones"][number];
  href: string;
  side: "left" | "right";
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex w-[88%] items-center gap-2.5 rounded-xl border border-cub-green-bright/30 bg-cub-green-muted/20 px-3 py-2.5 transition-colors hover:border-cub-green-bright/50",
        side === "left" ? "mr-auto" : "ml-auto flex-row-reverse text-right",
      )}
    >
      <LevelShield level={milestone.milestoneNumber} status="COMPLETE" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-cub-off-white">{milestone.title}</p>
        <LessonStars
          approved={milestone.approvedCount}
          total={milestone.totalCards}
          locked={false}
          size="sm"
        />
        <p className="mt-1 text-[10px] font-bold uppercase text-cub-green-light">
          Level complete! Replay →
        </p>
      </div>
    </Link>
  );
}

export function CubTrainingPathStatusBar({
  unlockedLevels,
  totalLevels,
  cubXp,
}: {
  unlockedLevels: number;
  totalLevels: number;
  cubXp: number;
}) {
  return (
    <CubKidStatBar
      leftIcon="⭐"
      leftTitle={`${unlockedLevels} of ${totalLevels} levels unlocked`}
      leftSubtitle="Keep going, future legend!"
      rightIcon="💎"
      rightLabel="Your XP"
      rightValue={cubXp}
    />
  );
}

export function CubTrainingPathAdventure({
  summary,
  deckBasePath,
  cubXp,
}: CubTrainingPathAdventureProps) {
  const { milestones } = summary;

  if (milestones.length === 0) {
    return (
      <p className="text-center text-sm text-cub-muted">
        Your Training Path is getting set up — check back soon!
      </p>
    );
  }

  const featuredSlug =
    summary.activeMilestone?.slug ??
    milestones.find((m) => m.status === "UNLOCKED" || m.status === "IN_PROGRESS")?.slug ??
    milestones.find((m) => m.status === "COMPLETE")?.slug ??
    milestones[0]?.slug;

  const unlockedLevels = milestones.filter((m) => m.status !== "LOCKED").length;

  return (
    <div className="space-y-4">
      <CubTrainingPathStatusBar
        unlockedLevels={unlockedLevels}
        totalLevels={milestones.length}
        cubXp={cubXp}
      />

      <CubKidPanel
        eyebrow="🗺️ Adventure map"
        subtitle="Beat each level to unlock the next"
        contentClassName="space-y-0"
      >
        <ol className="relative space-y-0">
          {milestones.map((milestone, index) => {
            const href = `${deckBasePath}/${milestone.slug}`;
            const isFeatured = milestone.slug === featuredSlug;
            const side = index % 2 === 0 ? "left" : "right";
            const showConnector = index > 0;

            return (
              <li key={milestone.slug}>
                {showConnector ? (
                  <PathConnector locked={milestone.status === "LOCKED"} />
                ) : null}

                {isFeatured ? (
                  <FeaturedLevelCard milestone={milestone} href={href} />
                ) : milestone.status === "LOCKED" ? (
                  <LockedLevelCard milestone={milestone} side={side} />
                ) : milestone.status === "COMPLETE" ? (
                  <CompleteLevelCard milestone={milestone} href={href} side={side} />
                ) : (
                  <FeaturedLevelCard milestone={milestone} href={href} />
                )}
              </li>
            );
          })}
        </ol>

        <div className="relative mt-5 rounded-2xl border border-cub-gold/25 bg-cub-gold-muted/15 px-4 py-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl" aria-hidden>
              🏆
            </span>
            <div>
              <p className="text-sm font-bold text-cub-gold-light">Rewards for finishing</p>
              <p className="mt-1 text-xs text-cub-muted">
                Complete the full path to earn bonus XP, C.U.B. badges, and bragging rights at
                Family Day!
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {["Bonus XP", "C.U.B. Badge", "Path Champion"].map((reward) => (
                  <span
                    key={reward}
                    className="rounded-full border border-cub-gold/30 bg-cub-ebony/60 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cub-gold-warm"
                  >
                    {reward}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CubKidPanel>
    </div>
  );
}
