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
    card: "border-cub-gold/35 bg-gradient-to-br from-cub-gold-muted/40 via-cub-charcoal/80 to-cub-ebony/90 shadow-cub-gold/15",
    affordable: "ring-2 ring-cub-gold/50 shadow-lg shadow-cub-gold/20",
    badge: "bg-cub-gold text-cub-ebony",
    button: "reward" as const,
  },
  green: {
    card: "border-cub-green/35 bg-gradient-to-br from-cub-green-muted/30 via-cub-charcoal/80 to-cub-ebony/90 shadow-cub-green/15",
    affordable: "ring-2 ring-cub-green-bright/45 shadow-lg shadow-cub-green/20",
    badge: "bg-cub-green-bright text-cub-off-white",
    button: "constructive" as const,
  },
  violet: {
    card: "border-violet-500/35 bg-gradient-to-br from-violet-950/50 via-cub-charcoal/80 to-cub-ebony/90",
    affordable: "ring-2 ring-violet-400/45 shadow-lg shadow-violet-900/30",
    badge: "bg-violet-600 text-white",
    button: "neutral" as const,
  },
  sky: {
    card: "border-sky-500/35 bg-gradient-to-br from-sky-950/40 via-cub-charcoal/80 to-cub-ebony/90",
    affordable: "ring-2 ring-sky-400/45 shadow-lg shadow-sky-900/30",
    badge: "bg-sky-600 text-white",
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
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-cub-gold/30 bg-cub-gold-muted/20 px-4 py-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-cub-gold-light">
            Your stash
          </p>
          <p className="text-2xl font-bold text-cub-off-white">
            {availableFocusTokens}{" "}
            <span className="text-base font-semibold text-cub-gold">
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

      <h3 className="mt-3 text-lg font-bold text-cub-off-white">{item.title}</h3>
      {item.description ? (
        <p className="mt-1 text-sm text-cub-muted">{item.description}</p>
      ) : null}
      {grantLabel ? (
        <p className="mt-2 text-xs font-medium text-cub-gold-light">{grantLabel}</p>
      ) : null}
      {declinedNote && !isPendingApproval ? (
        <p className="mt-2 rounded-lg border border-cub-charcoal/80 bg-cub-charcoal/50 px-3 py-2 text-xs text-cub-muted">
          <span className="font-medium text-cub-off-white">Parent said: </span>
          {declinedNote}
        </p>
      ) : null}

      <div className="mt-4">
        {isPendingApproval ? (
          <div className="rounded-xl border border-cub-gold/30 bg-cub-gold-muted/20 px-3 py-2 text-center text-sm font-medium text-cub-gold-light">
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
          <div className="rounded-xl border border-cub-charcoal bg-cub-charcoal/60 px-3 py-2 text-center text-sm text-cub-muted">
            Save up {item.costFocusTokens - availableFocusTokens} more token
            {item.costFocusTokens - availableFocusTokens === 1 ? "" : "s"}
          </div>
        )}
      </div>
    </li>
  );
}
