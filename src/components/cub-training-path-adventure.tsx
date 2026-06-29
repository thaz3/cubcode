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
              ? "text-slate-300"
              : index < approved
                ? "text-kid-yellow drop-shadow-[0_0_4px_rgba(255,216,77,0.6)]"
                : "text-slate-300",
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
          ? "border-slate-300 border-b-slate-400 bg-gradient-to-b from-slate-200 to-slate-300 text-slate-500"
          : isComplete
            ? "border-emerald-500 border-b-emerald-600 bg-gradient-to-b from-kid-green to-emerald-400 text-kid-ink shadow-md shadow-emerald-300/40"
            : "border-kid-purple border-b-[#6a4de6] bg-gradient-to-b from-kid-purple to-[#9b7fff] text-white shadow-lg shadow-kid-purple/40",
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
            ? "bg-slate-200"
            : "bg-gradient-to-b from-kid-purple/80 to-kid-blue/50 shadow-[0_0_12px_rgba(123,92,255,0.35)]",
        )}
      />
      {locked ? (
        <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs ring-2 ring-slate-300">
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
            ? "border-kid-green/50 bg-gradient-to-br from-emerald-50 via-white to-kid-cream shadow-emerald-200/30"
            : "border-kid-purple/50 bg-gradient-to-br from-kid-lavender via-white to-kid-sky shadow-kid-purple/20 ring-2 ring-kid-purple/15",
        )}
      >
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-kid-purple/15 blur-2xl"
          aria-hidden
        />

        <div className="relative flex gap-3">
          <LevelShield
            level={milestone.milestoneNumber}
            status={milestone.status}
            large
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-black text-kid-ink group-hover:text-kid-purple">
              {milestone.title}
            </h3>
            <div className="mt-1.5">
              <LessonStars
                approved={milestone.approvedCount}
                total={milestone.totalCards}
                locked={false}
              />
            </div>
            <p className="mt-1.5 text-xs text-kid-ink-muted">
              {milestone.approvedCount}/{milestone.totalCards} lessons complete
            </p>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full border border-kid-purple/15 bg-kid-lavender/50">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  isComplete ? "bg-kid-green" : "bg-gradient-to-r from-kid-purple to-kid-blue",
                )}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="mt-3">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-xl px-5 py-2 text-sm font-bold uppercase tracking-wide shadow-md",
                  isComplete
                    ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-300"
                    : "bg-kid-blue text-white shadow-kid-blue/30 group-hover:bg-kid-purple",
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
        "flex w-[88%] items-center gap-2.5 rounded-2xl border-2 border-slate-200 bg-slate-50 px-3 py-2.5 opacity-90",
        side === "left" ? "mr-auto" : "ml-auto flex-row-reverse text-right",
      )}
    >
      <LevelShield level={milestone.milestoneNumber} status="LOCKED" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-400">{milestone.title}</p>
        <LessonStars approved={0} total={milestone.totalCards} locked size="sm" />
        <p className="mt-1 text-[10px] font-semibold text-slate-400">
          🔮 Complete the previous level to unlock
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
        "group flex w-[88%] items-center gap-2.5 rounded-2xl border-2 border-emerald-200 bg-emerald-50 px-3 py-2.5 transition-colors hover:border-emerald-400 hover:shadow-md",
        side === "left" ? "mr-auto" : "ml-auto flex-row-reverse text-right",
      )}
    >
      <LevelShield level={milestone.milestoneNumber} status="COMPLETE" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-black text-kid-ink">{milestone.title}</p>
        <LessonStars
          approved={milestone.approvedCount}
          total={milestone.totalCards}
          locked={false}
          size="sm"
        />
        <p className="mt-1 text-[10px] font-black uppercase text-emerald-600">
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
      leftSubtitle="Keep going, future legend! ⭐"
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
      <p className="text-center text-sm font-medium text-kid-ink-muted">
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
        eyebrow="🗺️ Adventure Map"
        subtitle="Beat each level to unlock the next — stars, badges, and XP await!"
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

        <div className="relative mt-5 rounded-2xl border-2 border-kid-yellow/40 bg-kid-yellow/15 px-4 py-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl" aria-hidden>
              🏆
            </span>
            <div>
              <p className="text-sm font-black text-kid-ink">Rewards for finishing</p>
              <p className="mt-1 text-xs text-kid-ink-muted">
                Complete the full path to earn bonus XP, C.U.B. badges, and bragging rights at
                Family Day!
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {["Bonus XP", "C.U.B. Badge", "Path Champion"].map((reward) => (
                  <span
                    key={reward}
                    className="rounded-full border-2 border-kid-orange/40 bg-white px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-orange-700"
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
