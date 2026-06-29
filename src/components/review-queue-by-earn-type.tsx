"use client";

import { useMemo, useState } from "react";
import { ChallengeReviewCard } from "@/components/challenge-review-card";
import { FocusDeckReviewCard } from "@/components/focus-deck-review-card";
import { ReviewCard } from "@/components/review-card";
import { EarnTypeBadge } from "@/components/earn-type-badge";
import {
  EARN_TYPES,
  getEarnTypeMeta,
  getTaskEarnType,
  type EarnType,
} from "@/lib/earn-types";
import type { ReviewQueueItem } from "@/lib/review-queue";
import { cn } from "@/lib/utils";

export type { ReviewQueueItem } from "@/lib/review-queue";

function getReviewItemEarnType(item: ReviewQueueItem): EarnType {
  if (item.kind === "routine") return "routine";
  if (item.kind === "growth_pick") return "growth_pick";
  return getTaskEarnType(item);
}

type ReviewQueueByEarnTypeProps = {
  items: ReviewQueueItem[];
};

export function ReviewQueueByEarnType({ items }: ReviewQueueByEarnTypeProps) {
  const [filter, setFilter] = useState<EarnType | "all">("all");

  const counts = useMemo(() => {
    const map = Object.fromEntries(
      EARN_TYPES.map((type) => [type, 0]),
    ) as Record<EarnType, number>;

    for (const item of items) {
      map[getReviewItemEarnType(item)] += 1;
    }
    return map;
  }, [items]);

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((item) => getReviewItemEarnType(item) === filter);
  }, [filter, items]);

  const grouped = useMemo(() => {
    const map = new Map<EarnType, ReviewQueueItem[]>();
    for (const earnType of EARN_TYPES) {
      map.set(earnType, []);
    }
    for (const item of filtered) {
      const type = getReviewItemEarnType(item);
      map.get(type)!.push(item);
    }
    return map;
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <FilterChip
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label={`All (${items.length})`}
        />
        {EARN_TYPES.map((earnType) => {
          const count = counts[earnType];
          if (count === 0) return null;
          const meta = getEarnTypeMeta(earnType);
          return (
            <FilterChip
              key={earnType}
              active={filter === earnType}
              onClick={() => setFilter(earnType)}
              label={`${meta.shortLabel} (${count})`}
            />
          );
        })}
      </div>

      <div className="space-y-8">
        {EARN_TYPES.map((earnType) => {
          const sectionItems = grouped.get(earnType) ?? [];
          if (sectionItems.length === 0) return null;
          if (filter !== "all" && filter !== earnType) return null;

          const meta = getEarnTypeMeta(earnType);

          return (
            <section key={earnType} className="space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <EarnTypeBadge earnType={earnType} size="md" />
                  <h2 className="text-lg font-semibold text-zinc-100">
                    {meta.label} submissions
                  </h2>
                </div>
                <p className="mt-1 text-sm text-zinc-500">{meta.purpose}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {sectionItems.map((item) => {
                  if (item.kind === "routine") {
                    return (
                      <ChallengeReviewCard key={`routine-${item.log.id}`} log={item.log} />
                    );
                  }
                  if (item.kind === "growth_pick") {
                    return (
                      <FocusDeckReviewCard
                        key={`growth-${item.completion.id}`}
                        completion={item.completion}
                      />
                    );
                  }

                  return (
                    <ReviewCard
                      key={`task-${item.id}`}
                      task={{
                        id: item.id,
                        title: item.title,
                        status: item.status,
                        proofType: item.proofType,
                        reflection: item.reflection,
                        submittedAt: item.submittedAt,
                        cub: item.cub,
                      }}
                      earnType={getTaskEarnType(item)}
                      trainingLevelTitle={item.trainingDeckTitle}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-cub-gold-muted text-cub-gold-light ring-1 ring-cub-gold/40"
          : "bg-cub-charcoal text-cub-muted hover:text-cub-off-white",
      )}
    >
      {label}
    </button>
  );
}
