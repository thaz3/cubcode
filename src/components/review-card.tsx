"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { CubLink } from "@/components/cub-link";
import type { ActionState } from "@/lib/actions/auth";
import { approveTaskAction } from "@/lib/actions/tasks";
import { cubErrorText, cubLink, cubSuccessText } from "@/lib/cub-theme";
import { EarnTypeBadge } from "@/components/earn-type-badge";
import { formatProofType } from "@/lib/task-labels";
import type { EarnType } from "@/lib/earn-types";
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
  earnType?: Extract<EarnType, "task" | "training_path">;
  trainingLevelTitle?: string | null;
};

export function ReviewCard({
  task,
  earnType = "task",
  trainingLevelTitle,
}: ReviewCardProps) {
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
    <Card variant="accent" className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <EarnTypeBadge earnType={earnType} />
          <h2 className="text-lg font-semibold text-cub-off-white">{task.title}</h2>
          <StatusBadge status={task.status} />
        </div>
        <p className="text-sm text-cub-muted">
          {task.cub ? (
            <>
              <CubLink
                cubId={task.cub.id}
                displayName={task.cub.displayName}
                className={cubLink}
              />{" "}
              · {formatProofType(task.proofType)}
              {trainingLevelTitle ? ` · ${trainingLevelTitle}` : ""}
            </>
          ) : (
            <>
              Unknown Cub · {formatProofType(task.proofType)}
              {trainingLevelTitle ? ` · ${trainingLevelTitle}` : ""}
            </>
          )}
        </p>
        {reflectionSnippet ? (
          <p className="rounded-xl bg-cub-ebony/60 px-3 py-2 text-sm text-cub-off-white">
            {reflectionSnippet}
          </p>
        ) : null}
        {task.submittedAt ? (
          <p className="text-xs text-cub-muted">
            Submitted {task.submittedAt.toLocaleString()}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <form action={approveAction} className="flex-1">
          <input type="hidden" name="taskId" value={task.id} />
          <Button
            type="submit"
            variant="constructive"
            fullWidth
            size="lg"
            disabled={pending}
          >
            {pending ? "Approving…" : "Approve"}
          </Button>
        </form>
        <Link
          href={`/dashboard/tasks/review/${task.id}`}
          className="flex-1"
        >
          <Button variant="neutral" fullWidth size="lg">
            Full review
          </Button>
        </Link>
      </div>

      {state.success ? (
        <p className={`text-sm ${cubSuccessText}`}>{state.success}</p>
      ) : state.error ? (
        <p className={`text-sm ${cubErrorText}`}>{state.error}</p>
      ) : null}
    </Card>
  );
}
