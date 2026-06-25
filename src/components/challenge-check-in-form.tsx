"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { ActionState } from "@/lib/actions/auth";
import {
  checkInChallengeAction,
  submitChallengeCheckInAction,
} from "@/lib/actions/challenges";
import { getChallengeChecklistItems } from "@/lib/challenge-checklist";
import type { Challenge, ChallengeProgressLog } from "@/generated/prisma/client";
import { ChallengeProgressBadge } from "@/components/challenge-progress-badge";

type ChallengeCheckInFormProps = {
  challenge: Challenge;
  log: ChallengeProgressLog | null;
  intervalLabel: string;
};

export function ChallengeCheckInForm({
  challenge,
  log,
  intervalLabel,
}: ChallengeCheckInFormProps) {
  const [checkInState, checkInAction, checkInPending] = useActionState(
    checkInChallengeAction,
    {} as ActionState,
  );
  const [submitState, submitAction, submitPending] = useActionState(
    submitChallengeCheckInAction,
    {} as ActionState,
  );

  const checklistItems = getChallengeChecklistItems(challenge);
  const checklistData =
    log?.checklistData && typeof log.checklistData === "object"
      ? (log.checklistData as Record<string, boolean>)
      : {};

  const status = log?.status ?? "PENDING";
  const completed = log?.completed ?? false;
  const canCheckIn =
    status === "PENDING" || status === "SENT_BACK";
  const canSubmit = completed && canCheckIn;

  const message =
    checkInState.success ||
    submitState.success ||
    checkInState.error ||
    submitState.error;

  if (status === "SUBMITTED") {
    return (
      <div className="space-y-3 rounded-2xl border border-cub-gold/30 bg-cub-gold-muted p-4">
        <ChallengeProgressBadge status="SUBMITTED" />
        <p className="text-sm text-zinc-300">
          You submitted this routine for {intervalLabel}. Your parent will review it soon.
        </p>
      </div>
    );
  }

  if (status === "REWARDED") {
    return (
      <div className="space-y-3 rounded-2xl border border-cub-green/30 bg-cub-green-muted p-4">
        <ChallengeProgressBadge status="REWARDED" />
        <p className="text-sm text-zinc-300">
          Approved for {intervalLabel}! Rewards were added to your progress.
        </p>
      </div>
    );
  }

  if (status === "REJECTED") {
    return (
      <div className="space-y-3 rounded-2xl border border-cub-red/30 bg-cub-red-muted p-4">
        <ChallengeProgressBadge status="REJECTED" />
        {log?.reviewNote ? (
          <p className="text-sm text-zinc-300">Parent note: {log.reviewNote}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-500">Interval: {intervalLabel}</p>

      {status === "SENT_BACK" && log?.reviewNote ? (
        <p className="rounded-xl border border-cub-gold/30 bg-cub-gold-muted px-3 py-2 text-sm text-cub-gold-light">
          Parent note: {log.reviewNote}
        </p>
      ) : null}

      {canCheckIn ? (
        <form action={checkInAction} className="space-y-3">
          <input type="hidden" name="challengeId" value={challenge.id} />
          <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3">
            <input
              type="checkbox"
              name="completed"
              defaultChecked={completed}
              className="size-5 rounded border-zinc-600"
            />
            <span className="text-sm font-medium text-zinc-100">
              I did this routine
            </span>
          </label>
          <Button type="submit" variant="constructive" fullWidth disabled={checkInPending}>
            {checkInPending ? "Saving…" : completed ? "Update check-in" : "Mark as done"}
          </Button>
        </form>
      ) : null}

      {canSubmit ? (
        <form action={submitAction} className="space-y-4 border-t border-cub-off-white/10 pt-4">
          <input type="hidden" name="challengeId" value={challenge.id} />

          {challenge.proofType === "SHORT_REFLECTION" ? (
            <div>
              <Label htmlFor="reflection">Reflection</Label>
              <textarea
                id="reflection"
                name="reflection"
                rows={3}
                required
                minLength={10}
                defaultValue={log?.reflection ?? ""}
                className="w-full min-h-11 rounded-xl border border-zinc-700 bg-cub-ebony px-4 py-2.5 text-base text-zinc-100 outline-none ring-cub-gold focus:ring-2"
                placeholder="What did you do?"
              />
            </div>
          ) : null}

          {challenge.proofType === "CHECKLIST" ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-300">Checklist</p>
              {checklistItems.map((item, index) => (
                <label
                  key={item}
                  className="flex min-h-11 items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2"
                >
                  <input
                    type="checkbox"
                    name={`checklistItem${index}`}
                    defaultChecked={checklistData[item] === true}
                    className="size-5 rounded border-zinc-600"
                  />
                  <span className="text-sm text-zinc-200">{item}</span>
                </label>
              ))}
            </div>
          ) : null}

          {challenge.proofType === "PARENT_APPROVAL" ? (
            <p className="text-sm text-zinc-400">
              Your parent will confirm this routine when they review your check-in.
            </p>
          ) : null}

          <Button type="submit" variant="reward" fullWidth size="lg" disabled={submitPending}>
            {submitPending ? "Submitting…" : "Submit for parent review"}
          </Button>
        </form>
      ) : null}

      {message ? (
        <p
          className={
            message.includes("Submitted") || message.includes("Marked")
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
