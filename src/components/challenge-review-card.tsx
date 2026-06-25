"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChallengeProgressBadge } from "@/components/challenge-progress-badge";
import { CubLink } from "@/components/cub-link";
import type { ActionState } from "@/lib/actions/auth";
import { approveChallengeProgressAction } from "@/lib/actions/challenges";
import { formatChallengeInterval } from "@/lib/challenge-intervals";
import type { ChallengeIntervalType, ChallengeProgressStatus } from "@/generated/prisma/client";

type ChallengeReviewCardProps = {
  log: {
    id: string;
    reflection: string | null;
    submittedAt: Date | null;
    status: ChallengeProgressStatus;
    challenge: {
      title: string;
      intervalType: ChallengeIntervalType;
      intervalConfig: unknown;
    };
    cub: { id: string; displayName: string };
  };
};

export function ChallengeReviewCard({ log }: ChallengeReviewCardProps) {
  const [state, approveAction, pending] = useActionState(
    approveChallengeProgressAction,
    {} as ActionState,
  );

  const reflectionSnippet = log.reflection
    ? log.reflection.length > 120
      ? `${log.reflection.slice(0, 120)}…`
      : log.reflection
    : null;

  return (
    <Card variant="interactive" className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-violet-950 px-2 py-0.5 text-xs font-semibold text-violet-300">
            Routine
          </span>
          <h2 className="text-lg font-semibold text-zinc-50">
            {log.challenge.title}
          </h2>
          <ChallengeProgressBadge status={log.status} />
        </div>
        <p className="text-sm text-zinc-400">
          <CubLink
            cubId={log.cub.id}
            displayName={log.cub.displayName}
            className="font-medium text-amber-500 hover:text-amber-400"
          />{" "}
          · {formatChallengeInterval(log.challenge.intervalType, log.challenge.intervalConfig)}
        </p>
        {reflectionSnippet ? (
          <p className="rounded-xl bg-zinc-950/60 px-3 py-2 text-sm text-zinc-300">
            {reflectionSnippet}
          </p>
        ) : null}
        {log.submittedAt ? (
          <p className="text-xs text-zinc-500">
            Submitted {log.submittedAt.toLocaleString()}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <form action={approveAction} className="flex-1">
          <input type="hidden" name="logId" value={log.id} />
          <Button type="submit" fullWidth size="lg" disabled={pending}>
            {pending ? "Approving…" : "Approve"}
          </Button>
        </form>
        <Link
          href={`/dashboard/challenges/review/${log.id}`}
          className="flex-1"
        >
          <Button variant="secondary" fullWidth size="lg">
            Full review
          </Button>
        </Link>
      </div>

      {state.success ? (
        <p className="text-sm text-emerald-400">{state.success}</p>
      ) : state.error ? (
        <p className="text-sm text-red-400">{state.error}</p>
      ) : null}
    </Card>
  );
}
