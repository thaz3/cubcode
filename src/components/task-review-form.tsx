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
    <div className="space-y-6">
      <form action={approveAction} className="space-y-3 rounded-lg border border-green-200 p-4 dark:border-green-900">
        <input type="hidden" name="taskId" value={taskId} />
        <h3 className="font-medium text-green-800 dark:text-green-300">Approve</h3>
        <div>
          <Label htmlFor="approve-note">Note (optional)</Label>
          <textarea
            id="approve-note"
            name="reviewNote"
            rows={2}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <Button type="submit" disabled={approvePending}>
          {approvePending ? "Approving..." : "Approve task"}
        </Button>
      </form>

      <form action={sendBackAction} className="space-y-3 rounded-lg border border-orange-200 p-4 dark:border-orange-900">
        <input type="hidden" name="taskId" value={taskId} />
        <h3 className="font-medium text-orange-800 dark:text-orange-300">Send back</h3>
        <div>
          <Label htmlFor="sendback-note">Note (required)</Label>
          <textarea
            id="sendback-note"
            name="reviewNote"
            rows={2}
            required
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <Button type="submit" variant="secondary" disabled={sendBackPending}>
          {sendBackPending ? "Sending..." : "Send back for revision"}
        </Button>
      </form>

      <form action={rejectAction} className="space-y-3 rounded-lg border border-red-200 p-4 dark:border-red-900">
        <input type="hidden" name="taskId" value={taskId} />
        <h3 className="font-medium text-red-800 dark:text-red-300">Reject</h3>
        <div>
          <Label htmlFor="reject-note">Note (required)</Label>
          <textarea
            id="reject-note"
            name="reviewNote"
            rows={2}
            required
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <Button type="submit" variant="danger" disabled={rejectPending}>
          {rejectPending ? "Rejecting..." : "Reject task"}
        </Button>
      </form>

      {message ? (
        <p
          className={
            message.includes("approved") ||
            message.includes("sent back") ||
            message.includes("rejected")
              ? "text-sm text-green-700"
              : "text-sm text-red-600"
          }
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
