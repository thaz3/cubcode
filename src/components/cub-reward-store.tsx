"use client";

import { requestRewardRedemptionAction } from "@/lib/actions/rewards";
import type { ActionState } from "@/lib/actions/auth";
import type { RewardGrantType } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { formatRewardGrantLabel } from "@/lib/reward-grant-labels";
import {
  getRewardStoreAccent,
  getRewardStoreEmoji,
} from "@/lib/reward-store-icons";
import { cn } from "@/lib/utils";
import { useActionState } from "react";

export type CubRewardStoreItem = {
  id: string;
  title: string;
  description: string | null;
  costFocusTokens: number;
  grantType: RewardGrantType;
  minutesGranted: number | null;
};

type CubRewardStoreProps = {
  cubId: string;
  availableFocusTokens: number;
  items: CubRewardStoreItem[];
  pendingItemIds: string[];
  declinedNotes?: Record<string, string>;
};

const ACCENT_STYLES = {
  gold: {
    card: "border-kid-yellow/50 bg-gradient-to-br from-kid-yellow/30 via-white to-kid-cream shadow-kid-orange/15",
    affordable: "ring-2 ring-kid-orange/50 shadow-lg shadow-kid-yellow/25",
    badge: "bg-kid-yellow text-kid-ink border-2 border-kid-orange/40",
    button: "reward" as const,
  },
  green: {
    card: "border-kid-green/45 bg-gradient-to-br from-emerald-50 via-white to-kid-cream shadow-emerald-200/30",
    affordable: "ring-2 ring-emerald-400/45 shadow-lg shadow-emerald-200/40",
    badge: "bg-kid-green text-kid-ink border-2 border-emerald-400/40",
    button: "constructive" as const,
  },
  violet: {
    card: "border-kid-purple/40 bg-gradient-to-br from-kid-lavender via-white to-kid-cream",
    affordable: "ring-2 ring-kid-purple/45 shadow-lg shadow-kid-purple/20",
    badge: "bg-kid-purple text-white",
    button: "neutral" as const,
  },
  sky: {
    card: "border-kid-blue/40 bg-gradient-to-br from-kid-sky via-white to-kid-cream",
    affordable: "ring-2 ring-kid-blue/45 shadow-lg shadow-kid-blue/20",
    badge: "bg-kid-blue text-white",
    button: "neutral" as const,
  },
};

export function CubRewardStore({
  cubId,
  availableFocusTokens,
  items,
  pendingItemIds,
  declinedNotes = {},
}: CubRewardStoreProps) {
  const [state, formAction, isPending] = useActionState(
    requestRewardRedemptionAction,
    {} as ActionState,
  );

  if (items.length === 0) {
    return (
      <p className="text-sm text-zinc-400">
        No rewards in the store yet. Your parent can add some from Parent&apos;s
        Room.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 rounded-2xl border-2 border-kid-yellow/50 bg-kid-yellow/20 px-4 py-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-kid-purple">
            🏆 Your stash
          </p>
          <p className="text-2xl font-black text-kid-ink">
            {availableFocusTokens}{" "}
            <span className="text-base font-bold text-kid-orange">
              Focus Token{availableFocusTokens === 1 ? "" : "s"}
            </span>
          </p>
        </div>
        <span className="text-3xl" aria-hidden>
          ✨
        </span>
      </div>

      {state.error ? (
        <p className="rounded-xl border border-cub-red-alert/40 bg-cub-red-muted/20 px-3 py-2 text-sm text-cub-red-light">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-xl border border-cub-green/40 bg-cub-green-muted/20 px-3 py-2 text-sm text-cub-green-light">
          {state.success}
        </p>
      ) : null}

      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <RewardStoreCard
            key={item.id}
            cubId={cubId}
            item={item}
            availableFocusTokens={availableFocusTokens}
            isPendingApproval={pendingItemIds.includes(item.id)}
            declinedNote={declinedNotes[item.id]}
            formAction={formAction}
            isSubmitting={isPending}
          />
        ))}
      </ul>
    </div>
  );
}

function RewardStoreCard({
  cubId,
  item,
  availableFocusTokens,
  isPendingApproval,
  declinedNote,
  formAction,
  isSubmitting,
}: {
  cubId: string;
  item: CubRewardStoreItem;
  availableFocusTokens: number;
  isPendingApproval: boolean;
  declinedNote?: string;
  formAction: (payload: FormData) => void;
  isSubmitting: boolean;
}) {
  const accent = getRewardStoreAccent(item);
  const styles = ACCENT_STYLES[accent];
  const emoji = getRewardStoreEmoji(item);
  const grantLabel = formatRewardGrantLabel(item);
  const canAfford = availableFocusTokens >= item.costFocusTokens;

  return (
    <li
      className={cn(
        "relative overflow-hidden rounded-2xl border p-4 transition",
        styles.card,
        canAfford && !isPendingApproval ? styles.affordable : "opacity-90",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-3xl" aria-hidden>
          {emoji}
        </span>
        <span
          className={cn(
            "inline-flex rounded-full px-2.5 py-1 text-xs font-bold",
            styles.badge,
          )}
        >
          {item.costFocusTokens} token{item.costFocusTokens === 1 ? "" : "s"}
        </span>
      </div>

      <h3 className="mt-3 text-lg font-black text-kid-ink">{item.title}</h3>
      {item.description ? (
        <p className="mt-1 text-sm text-kid-ink-muted">{item.description}</p>
      ) : null}
      {grantLabel ? (
        <p className="mt-2 text-xs font-bold text-kid-purple">{grantLabel}</p>
      ) : null}
      {declinedNote && !isPendingApproval ? (
        <p className="mt-2 rounded-xl border-2 border-kid-pink/30 bg-pink-50 px-3 py-2 text-xs text-kid-ink-muted">
          <span className="font-bold text-kid-ink">Parent said: </span>
          {declinedNote}
        </p>
      ) : null}

      <div className="mt-4">
        {isPendingApproval ? (
          <div className="rounded-xl border-2 border-kid-yellow/40 bg-kid-yellow/20 px-3 py-2 text-center text-sm font-bold text-orange-700">
            Waiting for parent approval…
          </div>
        ) : canAfford ? (
          <form action={formAction}>
            <input type="hidden" name="cubId" value={cubId} />
            <input type="hidden" name="rewardStoreItemId" value={item.id} />
            <Button
              type="submit"
              variant={styles.button}
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting ? "Asking parent…" : "Ask parent to redeem"}
            </Button>
          </form>
        ) : (
          <div className="rounded-xl border-2 border-kid-purple/20 bg-kid-lavender/50 px-3 py-2 text-center text-sm font-semibold text-kid-ink-muted">
            Save up {item.costFocusTokens - availableFocusTokens} more token
            {item.costFocusTokens - availableFocusTokens === 1 ? "" : "s"}
          </div>
        )}
      </div>
    </li>
  );
}
