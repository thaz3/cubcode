"use client";

import { CubColorBadge } from "@/components/cub-color-dot";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { ActionState } from "@/lib/actions/auth";
import {
  approveRewardRedemptionRequestAction,
  rejectRewardRedemptionRequestAction,
} from "@/lib/actions/rewards";
import { formatRewardGrantLabel } from "@/lib/reward-grant-labels";
import { getRewardStoreEmoji } from "@/lib/reward-store-icons";
import { cubSectionTitle } from "@/lib/cub-theme";
import { cn } from "@/lib/utils";
import { useActionState } from "react";

export type PendingRewardRedemptionRequest = {
  id: string;
  requestedAt: Date;
  cub: { id: string; displayName: string };
  rewardStoreItem: {
    id: string;
    title: string;
    description: string | null;
    costFocusTokens: number;
    grantType: Parameters<typeof formatRewardGrantLabel>[0]["grantType"];
    minutesGranted: number | null;
  };
};

type ParentRewardRequestsSectionProps = {
  requests: PendingRewardRedemptionRequest[];
  compact?: boolean;
};

export function ParentRewardRequestsSection({
  requests,
  compact = false,
}: ParentRewardRequestsSectionProps) {
  if (requests.length === 0) {
    return null;
  }

  return (
    <section
      id="reward-requests"
      className={cn("scroll-mt-4 space-y-3", compact ? "" : "")}
    >
      <div>
        <h2 className={cubSectionTitle}>Reward requests</h2>
        <p className="mt-1 text-sm text-cub-muted">
          {requests.length} Cub reward{requests.length === 1 ? "" : "s"} waiting
          for your yes or no.
        </p>
      </div>
      <ul className="space-y-3">
        {requests.map((request) => (
          <li key={request.id}>
            <RewardRequestCard request={request} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function RewardRequestCard({
  request,
}: {
  request: PendingRewardRedemptionRequest;
}) {
  const [approveState, approveAction, isApproving] = useActionState(
    approveRewardRedemptionRequestAction,
    {} as ActionState,
  );
  const [rejectState, rejectAction, isRejecting] = useActionState(
    rejectRewardRedemptionRequestAction,
    {} as ActionState,
  );

  const grantLabel = formatRewardGrantLabel(request.rewardStoreItem);
  const emoji = getRewardStoreEmoji(request.rewardStoreItem);
  const busy = isApproving || isRejecting;

  return (
    <div className="rounded-2xl border border-cub-gold/35 bg-gradient-to-br from-cub-gold-muted/20 via-cub-charcoal/80 to-cub-ebony p-4 shadow-md shadow-cub-gold/10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-2xl" aria-hidden>
              {emoji}
            </span>
            <span className="rounded-full bg-cub-gold-muted px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-cub-gold-light ring-1 ring-cub-gold/40">
              Reward request
            </span>
          </div>
          <p className="mt-2 text-lg font-semibold text-cub-off-white">
            {request.rewardStoreItem.title}
          </p>
          {request.rewardStoreItem.description ? (
            <p className="mt-1 text-sm text-cub-muted">
              {request.rewardStoreItem.description}
            </p>
          ) : null}
          <p className="mt-2 inline-flex items-center gap-2 text-sm text-cub-muted">
            <CubColorBadge
              cubId={request.cub.id}
              displayName={request.cub.displayName}
            />
            <span>
              · {request.rewardStoreItem.costFocusTokens} token
              {request.rewardStoreItem.costFocusTokens === 1 ? "" : "s"}
              {grantLabel ? ` · ${grantLabel}` : ""}
            </span>
          </p>
        </div>
      </div>

      {approveState.error || rejectState.error ? (
        <p className="mt-3 text-sm text-cub-red-light">
          {approveState.error ?? rejectState.error}
        </p>
      ) : null}
      {approveState.success ? (
        <p className="mt-3 text-sm text-cub-green-light">{approveState.success}</p>
      ) : null}
      {rejectState.success ? (
        <p className="mt-3 text-sm text-cub-muted">{rejectState.success}</p>
      ) : null}

      {!approveState.success && !rejectState.success ? (
        <div className="mt-4 space-y-3">
          <form action={approveAction}>
            <input type="hidden" name="requestId" value={request.id} />
            <Button type="submit" variant="reward" size="sm" disabled={busy}>
              {isApproving ? "Approving…" : "Approve & redeem"}
            </Button>
          </form>

          <form action={rejectAction} className="space-y-2">
            <input type="hidden" name="requestId" value={request.id} />
            <div>
              <Label htmlFor={`decline-note-${request.id}`}>
                Why not this time?{" "}
                <span className="font-normal text-cub-muted">(optional)</span>
              </Label>
              <textarea
                id={`decline-note-${request.id}`}
                name="reviewNote"
                rows={2}
                maxLength={500}
                placeholder="A line or two for your Cub — e.g. School night; try again Saturday."
                className="mt-1.5 w-full rounded-lg border border-cub-charcoal bg-cub-ebony px-3 py-2 text-sm text-cub-off-white placeholder:text-cub-muted"
              />
            </div>
            <Button type="submit" variant="neutral" size="sm" disabled={busy}>
              {isRejecting ? "Declining…" : "Not this time"}
            </Button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
