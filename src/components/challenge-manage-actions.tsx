"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/actions/auth";
import {
  archiveChallengeAction,
  deleteChallengeAction,
  pauseChallengeAction,
} from "@/lib/actions/challenges";
import type { ChallengeStatus } from "@/generated/prisma/client";

type ChallengeManageActionsProps = {
  challengeId: string;
  status: ChallengeStatus;
  canHardDelete: boolean;
};

export function ChallengeManageActions({
  challengeId,
  status,
  canHardDelete,
}: ChallengeManageActionsProps) {
  const [pauseState, pauseAction, pausePending] = useActionState(
    pauseChallengeAction,
    {} as ActionState,
  );
  const [archiveState, archiveAction, archivePending] = useActionState(
    archiveChallengeAction,
    {} as ActionState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteChallengeAction,
    {} as ActionState,
  );

  const message =
    pauseState.success ||
    archiveState.success ||
    deleteState.success ||
    pauseState.error ||
    archiveState.error ||
    deleteState.error;

  return (
    <div className="space-y-3 rounded-2xl border border-cub-off-white/10 bg-cub-charcoal/40 p-4">
      <h3 className="text-sm font-semibold text-cub-off-white">Manage challenge</h3>

      {status !== "ARCHIVED" ? (
        <form action={pauseAction}>
          <input type="hidden" name="challengeId" value={challengeId} />
          <Button type="submit" variant="neutral" fullWidth disabled={pausePending}>
            {pausePending
              ? "Saving…"
              : status === "PAUSED"
                ? "Resume challenge"
                : "Pause challenge"}
          </Button>
        </form>
      ) : null}

      {status !== "ARCHIVED" ? (
        <form action={archiveAction}>
          <input type="hidden" name="challengeId" value={challengeId} />
          <Button type="submit" variant="dangerOutline" fullWidth disabled={archivePending}>
            {archivePending ? "Archiving…" : "Archive challenge"}
          </Button>
        </form>
      ) : null}

      {canHardDelete && status !== "ARCHIVED" ? (
        <form action={deleteAction}>
          <input type="hidden" name="challengeId" value={challengeId} />
          <Button type="submit" variant="danger" fullWidth disabled={deletePending}>
            {deletePending ? "Deleting…" : "Delete challenge"}
          </Button>
        </form>
      ) : (
        <p className="text-xs text-zinc-500">
          Challenges with check-in history can only be archived, not deleted.
        </p>
      )}

      {message ? (
        <p
          className={
            message.includes("error") || message.includes("not")
              ? "text-sm text-red-400"
              : "text-sm text-emerald-400"
          }
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
