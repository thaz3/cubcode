"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/actions/auth";
import { cancelFocusSessionAction } from "@/lib/actions/growth-board";

type CancelFocusSessionFormProps = {
  cubId: string;
  taskId: string;
  label?: string;
  size?: "sm" | "md";
  variant?: "dangerOutline" | "ghost";
  className?: string;
};

export function CancelFocusSessionForm({
  cubId,
  taskId,
  label = "End session",
  size = "sm",
  variant = "dangerOutline",
  className,
}: CancelFocusSessionFormProps) {
  const [state, formAction, isPending] = useActionState(
    cancelFocusSessionAction,
    {} as ActionState,
  );

  return (
    <form
      action={formAction}
      className={className}
      onSubmit={(event) => {
        if (
          !confirm(
            "End this focus session? You can start a new one in this area later.",
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="cubId" value={cubId} />
      <input type="hidden" name="taskId" value={taskId} />
      {state.error ? (
        <p className="mb-1 text-xs text-cub-red-light">{state.error}</p>
      ) : null}
      <Button type="submit" variant={variant} size={size} disabled={isPending}>
        {isPending ? "Ending..." : label}
      </Button>
    </form>
  );
}
