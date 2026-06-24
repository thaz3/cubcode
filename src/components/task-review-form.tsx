"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { ActionState } from "@/lib/actions/auth";
import {
  approveTaskAction,
  rejectTaskAction,
  sendBackTaskAction,
} from "@/lib/actions/tasks";
import { useActionState } from "react";

type TaskReviewFormProps = {
  taskId: string;
};

export function TaskReviewForm({ taskId }: TaskReviewFormProps) {
  const [approveState, approveAction, approvePending] = useActionState(
    approveTaskAction,
    {} as ActionState,
  );
  const [rejectState, rejectAction, rejectPending] = useActionState(
    rejectTaskAction,
    {} as ActionState,
  );
  const [sendBackState, sendBackAction, sendBackPending] = useActionState(
    sendBackTaskAction,
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
        className="space-y-3 rounded-2xl border border-emerald-900/60 bg-emerald-950/20 p-4"
      >
        <input type="hidden" name="taskId" value={taskId} />
        <h3 className="font-medium text-emerald-300">Approve</h3>
        <div>
          <Label htmlFor="approve-note">Note (optional)</Label>
          <textarea
            id="approve-note"
            name="reviewNote"
            rows={2}
            className="w-full min-h-11 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-base text-zinc-100 outline-none ring-amber-500 focus:ring-2"
          />
        </div>
        <Button type="submit" fullWidth size="lg" disabled={approvePending}>
          {approvePending ? "Approving…" : "Approve"}
        </Button>
      </form>

      <form
        action={sendBackAction}
        className="space-y-3 rounded-2xl border border-orange-900/60 bg-orange-950/20 p-4"
      >
        <input type="hidden" name="taskId" value={taskId} />
        <h3 className="font-medium text-orange-300">Send back</h3>
        <div>
          <Label htmlFor="sendback-note">Note (required)</Label>
          <textarea
            id="sendback-note"
            name="reviewNote"
            rows={2}
            required
            className="w-full min-h-11 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-base text-zinc-100 outline-none ring-amber-500 focus:ring-2"
          />
        </div>
        <Button
          type="submit"
          variant="secondary"
          fullWidth
          size="lg"
          disabled={sendBackPending}
        >
          {sendBackPending ? "Sending…" : "Send back"}
        </Button>
      </form>

      <form
        action={rejectAction}
        className="space-y-3 rounded-2xl border border-red-900/60 bg-red-950/20 p-4"
      >
        <input type="hidden" name="taskId" value={taskId} />
        <h3 className="font-medium text-red-300">Reject</h3>
        <div>
          <Label htmlFor="reject-note">Note (required)</Label>
          <textarea
            id="reject-note"
            name="reviewNote"
            rows={2}
            required
            className="w-full min-h-11 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-base text-zinc-100 outline-none ring-amber-500 focus:ring-2"
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
          className={
            message.includes("approved") ||
            message.includes("sent back") ||
            message.includes("rejected")
              ? "text-sm text-emerald-400"
              : "text-sm text-red-400"
          }
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
