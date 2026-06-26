"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TrainingDeckBoardStatus } from "@/lib/training-board-progress";
import {
  TRAINING_DECK_STATUS_LABELS,
  getDeckCta,
} from "@/lib/training-board-progress";

export type TrainingMilestoneNode = {
  slug: string;
  milestoneNumber: number;
  title: string;
  description: string;
  status: TrainingDeckBoardStatus;
  approvedCount: number;
  totalCards: number;
};

type TrainingBoardPathProps = {
  milestones: TrainingMilestoneNode[];
  cubId: string;
};

const STATUS_STYLES: Record<
  TrainingDeckBoardStatus,
  { ring: string; node: string; badge: string }
> = {
  LOCKED: {
    ring: "border-zinc-700/60",
    node: "bg-zinc-900/80 text-zinc-500",
    badge: "bg-zinc-800 text-zinc-400",
  },
  UNLOCKED: {
    ring: "border-cub-gold/50 shadow-cub-gold/20",
    node: "cub-card-gold border-cub-gold/40",
    badge: "bg-cub-gold-muted text-cub-gold-light",
  },
  IN_PROGRESS: {
    ring: "border-sky-400/70 shadow-sky-500/25",
    node: "border-sky-400/50 bg-sky-950/40 text-cub-off-white shadow-lg shadow-sky-500/15",
    badge: "bg-sky-950 text-sky-200 ring-1 ring-sky-400/40",
  },
  COMPLETE: {
    ring: "border-cub-green-bright/50 shadow-cub-green/20",
    node: "border-cub-green-bright/40 cub-card-green",
    badge: "bg-cub-green-muted text-cub-green-light",
  },
};

export function TrainingBoardPath({ milestones, cubId }: TrainingBoardPathProps) {
  return (
    <ol className="relative space-y-4">
      <div
        className="absolute bottom-4 left-5 top-4 w-px bg-gradient-to-b from-cub-gold/40 via-zinc-700 to-zinc-800"
        aria-hidden
      />
      {milestones.map((milestone, index) => {
        const styles = STATUS_STYLES[milestone.status];
        const cta = getDeckCta(milestone.status);
        const href = `/dashboard/tasks/templates/deck/${milestone.slug}?cubId=${cubId}`;

        return (
          <li key={milestone.slug} className="relative pl-12">
            <div
              className={cn(
                "absolute left-0 top-6 flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold",
                styles.node,
                styles.ring,
              )}
            >
              {milestone.status === "COMPLETE" ? "✓" : milestone.milestoneNumber}
            </div>

            {index < milestones.length - 1 ? (
              <div className="absolute left-5 top-16 h-[calc(100%-1rem)] w-px bg-zinc-800" aria-hidden />
            ) : null}

            <div
              className={cn(
                "rounded-2xl border p-4 shadow-md transition",
                styles.node,
                styles.ring,
                milestone.status === "IN_PROGRESS" && "ring-2",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-cub-gold-light">
                      Milestone {milestone.milestoneNumber}
                    </p>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                        styles.badge,
                      )}
                    >
                      {TRAINING_DECK_STATUS_LABELS[milestone.status]}
                    </span>
                  </div>
                  <h2 className="mt-1 text-lg font-semibold text-cub-off-white">
                    {milestone.title}
                  </h2>
                  <p className="mt-1 text-sm text-cub-muted">{milestone.description}</p>
                  <p className="mt-2 text-sm text-cub-gold/90">
                    {milestone.approvedCount}/{milestone.totalCards} cards complete
                  </p>
                </div>

                {cta.disabled ? (
                  <Button size="sm" variant="neutral" disabled>
                    {cta.label}
                  </Button>
                ) : (
                  <Link href={href}>
                    <Button
                      size="sm"
                      variant={
                        milestone.status === "COMPLETE"
                          ? "secondary"
                          : milestone.status === "IN_PROGRESS"
                            ? "constructive"
                            : "reward"
                      }
                    >
                      {cta.label}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
