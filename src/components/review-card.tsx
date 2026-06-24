"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { CubLink } from "@/components/cub-link";
import type { ActionState } from "@/lib/actions/auth";
import { approveTaskAction } from "@/lib/actions/tasks";
import { formatProofType } from "@/lib/task-labels";
import type { TaskProofType, TaskStatus } from "@/generated/prisma/client";

type ReviewCardTask = {
  id: string;
  title: string;
  status: TaskStatus;
  proofType: TaskProofType;
  reflection: string | null;
  submittedAt: Date | null;
  cub: { id: string; displayName: string } | null;
};

type ReviewCardProps = {
  task: ReviewCardTask;
};

export function ReviewCard({ task }: ReviewCardProps) {
  const [state, approveAction, pending] = useActionState(
    approveTaskAction,
    {} as ActionState,
  );

  const reflectionSnippet = task.reflection
    ? task.reflection.length > 120
      ? `${task.reflection.slice(0, 120)}…`
      : task.reflection
    : null;

  return (
    <Card variant="interactive" className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold text-zinc-50">{task.title}</h2>
          <StatusBadge status={task.status} />
        </div>
        <p className="text-sm text-zinc-400">
          {task.cub ? (
            <>
              <CubLink
                cubId={task.cub.id}
                displayName={task.cub.displayName}
                className="font-medium text-amber-500 hover:text-amber-400"
              />{" "}
              · {formatProofType(task.proofType)}
            </>
          ) : (
            <>Unknown Cub · {formatProofType(task.proofType)}</>
          )}
        </p>
        {reflectionSnippet ? (
          <p className="rounded-xl bg-zinc-950/60 px-3 py-2 text-sm text-zinc-300">
            {reflectionSnippet}
          </p>
        ) : null}
        {task.submittedAt ? (
          <p className="text-xs text-zinc-500">
            Submitted {task.submittedAt.toLocaleString()}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <form action={approveAction} className="flex-1">
          <input type="hidden" name="taskId" value={task.id} />
          <Button type="submit" fullWidth size="lg" disabled={pending}>
            {pending ? "Approving…" : "Approve"}
          </Button>
        </form>
        <Link
          href={`/dashboard/tasks/review/${task.id}`}
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
