"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { ActionState } from "@/lib/actions/auth";
import { cubErrorText, cubSuccessText } from "@/lib/cub-theme";
import {
  approveChallengeProgressAction,
  rejectChallengeProgressAction,
  sendBackChallengeProgressAction,
} from "@/lib/actions/challenges";
import { cn } from "@/lib/utils";
import { useActionState } from "react";

type ChallengeReviewFormProps = {
  logId: string;
};

export function ChallengeReviewForm({ logId }: ChallengeReviewFormProps) {
  const [approveState, approveAction, approvePending] = useActionState(
    approveChallengeProgressAction,
    {} as ActionState,
  );
  const [rejectState, rejectAction, rejectPending] = useActionState(
    rejectChallengeProgressAction,
    {} as ActionState,
  );
  const [sendBackState, sendBackAction, sendBackPending] = useActionState(
    sendBackChallengeProgressAction,
    {} as ActionState,
  );

  const message =
    approveState.success ||
    rejectState.success ||
    sendBackState.success ||
    approveState.error ||
    rejectState.error ||
    sendBackState.error;

  return (
    <div className="space-y-4">
      <form
        action={approveAction}
        className="space-y-3 rounded-2xl border border-cub-green/40 bg-cub-green-muted p-4"
      >
        <input type="hidden" name="logId" value={logId} />
        <h3 className="font-medium text-cub-green-light">Approve</h3>
        <div>
          <Label htmlFor="approve-note">Note (optional)</Label>
          <textarea
            id="approve-note"
            name="reviewNote"
            rows={2}
            className="w-full min-h-11 rounded-xl border border-cub-off-white/15 bg-cub-ebony px-4 py-2.5 text-base text-cub-off-white outline-none ring-cub-gold focus:ring-2"
          />
        </div>
        <Button
          type="submit"
          variant="constructive"
          fullWidth
          size="lg"
          disabled={approvePending}
        >
          {approvePending ? "Approving…" : "Approve"}
        </Button>
      </form>

      <form
        action={sendBackAction}
        className="space-y-3 rounded-2xl border border-cub-gold/40 bg-cub-gold-muted p-4"
      >
        <input type="hidden" name="logId" value={logId} />
        <h3 className="font-medium text-cub-gold-light">Send back</h3>
        <div>
          <Label htmlFor="sendback-note">Note (required)</Label>
          <textarea
            id="sendback-note"
            name="reviewNote"
            rows={2}
            required
            className="w-full min-h-11 rounded-xl border border-cub-off-white/15 bg-cub-ebony px-4 py-2.5 text-base text-cub-off-white outline-none ring-cub-gold focus:ring-2"
          />
        </div>
        <Button
          type="submit"
          variant="warning"
          fullWidth
          size="lg"
          disabled={sendBackPending}
        >
          {sendBackPending ? "Sending…" : "Send back"}
        </Button>
      </form>

      <form
        action={rejectAction}
        className="space-y-3 rounded-2xl border border-cub-red/40 bg-cub-red-muted p-4"
      >
        <input type="hidden" name="logId" value={logId} />
        <h3 className="font-medium text-cub-red-light">Reject</h3>
        <div>
          <Label htmlFor="reject-note">Note (required)</Label>
          <textarea
            id="reject-note"
            name="reviewNote"
            rows={2}
            required
            className="w-full min-h-11 rounded-xl border border-cub-off-white/15 bg-cub-ebony px-4 py-2.5 text-base text-cub-off-white outline-none ring-cub-gold focus:ring-2"
          />
        </div>
        <Button
          type="submit"
          variant="danger"
          fullWidth
          size="lg"
          disabled={rejectPending}
        >
          {rejectPending ? "Rejecting…" : "Reject"}
        </Button>
      </form>

      {message ? (
        <p
          className={cn(
            "text-sm",
            message.includes("approved") ||
              message.includes("sent back") ||
              message.includes("rejected")
              ? cubSuccessText
              : cubErrorText,
          )}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
