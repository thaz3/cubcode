"use client";

import { useActionState } from "react";
import { RequestSessionTimer } from "@/components/request-session-timer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ActionState } from "@/lib/actions/auth";
import {
  parentEndFocusSessionAction,
  parentPauseFocusSessionAction,
} from "@/lib/actions/growth-board";

type ParentFocusSessionControlsProps = {
  taskId: string;
  cubName: string;
  focusSessionStartedAt: string | null;
  canEnd: boolean;
  compact?: boolean;
};

export function ParentFocusSessionControls({
  taskId,
  cubName,
  focusSessionStartedAt,
  canEnd,
  compact = false,
}: ParentFocusSessionControlsProps) {
  const [pauseState, pauseAction, pausePending] = useActionState(
    parentPauseFocusSessionAction,
    {} as ActionState,
  );
  const [endState, endAction, endPending] = useActionState(
    parentEndFocusSessionAction,
    {} as ActionState,
  );

  if (!canEnd && !focusSessionStartedAt) {
    return null;
  }

  const feedback =
    pauseState.success ||
    endState.success ||
    pauseState.error ||
    endState.error;

  const actions = (
    <div className="flex flex-wrap gap-2">
      {focusSessionStartedAt ? (
        <form action={pauseAction}>
          <input type="hidden" name="taskId" value={taskId} />
          <Button type="submit" variant="warning" size="sm" disabled={pausePending}>
            {pausePending ? "Pausing…" : "Pause timer"}
          </Button>
        </form>
      ) : null}

      {canEnd ? (
        <form
          action={endAction}
          onSubmit={(event) => {
            if (
              !confirm(
                "Remove this focus session? Your Cub can start a new one in this area later.",
              )
            ) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="taskId" value={taskId} />
          <Button type="submit" variant="dangerOutline" size="sm" disabled={endPending}>
            {endPending ? "Removing…" : "End focus session"}
          </Button>
        </form>
      ) : null}
    </div>
  );

  if (compact) {
    return (
      <div className="mt-3 space-y-2">
        {actions}
        {feedback ? (
          <p
            className={
              pauseState.success || endState.success
                ? "text-xs text-cub-green-light"
                : "text-xs text-cub-red-light"
            }
          >
            {feedback}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <Card variant="constructive" className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-cub-off-white">Focus session</h2>
        <p className="mt-1 text-sm text-cub-muted">
          {focusSessionStartedAt
            ? `${cubName} has instructions open — the request timer is running.`
            : `Manage ${cubName}'s active focus session.`}
        </p>
      </div>

      {focusSessionStartedAt ? (
        <RequestSessionTimer
          startedAt={focusSessionStartedAt}
          label="Request timer running"
        />
      ) : null}

      {actions}

      {feedback ? (
        <p
          className={
            pauseState.success || endState.success
              ? "text-sm text-cub-green-light"
              : "text-sm text-cub-red-light"
          }
        >
          {feedback}
        </p>
      ) : null}
    </Card>
  );
}
