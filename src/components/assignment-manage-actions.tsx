"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/actions/auth";
import { deleteAssignmentAction } from "@/lib/actions/tasks";
import type { TaskStatus } from "@/generated/prisma/client";

type AssignmentManageActionsProps = {
  taskId: string;
  status: TaskStatus;
  size?: "sm" | "lg";
  fullWidth?: boolean;
  showEdit?: boolean;
  className?: string;
};

function deleteConfirmMessage(status: TaskStatus): string {
  switch (status) {
    case "AVAILABLE":
      return "Remove this task from your library? This cannot be undone.";
    case "SUBMITTED":
      return "Delete this assignment and its submission? This cannot be undone.";
    case "APPROVED":
    case "COMPLETED":
      return "Delete this assignment record? Earned rewards stay with your Cub.";
    default:
      return "Delete this assignment? This cannot be undone.";
  }
}

function deleteLabel(status: TaskStatus): string {
  return status === "AVAILABLE" ? "Delete" : "Delete assignment";
}

export function AssignmentManageActions({
  taskId,
  status,
  size = "lg",
  fullWidth = false,
  showEdit = true,
  className,
}: AssignmentManageActionsProps) {
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteAssignmentAction,
    {} as ActionState,
  );

  return (
    <div className={className}>
      <div className="flex flex-col gap-2 sm:flex-row">
        {showEdit ? (
          <Link
            href={`/dashboard/tasks/${taskId}/edit`}
            className={fullWidth ? "flex-1" : undefined}
          >
            <Button variant="secondary" fullWidth={fullWidth} size={size}>
              Edit
            </Button>
          </Link>
        ) : null}

        <form
          action={deleteAction}
          className={fullWidth || !showEdit ? "flex-1" : undefined}
          onSubmit={(event) => {
            if (!confirm(deleteConfirmMessage(status))) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="taskId" value={taskId} />
          <Button
            type="submit"
            variant="dangerOutline"
            fullWidth={fullWidth}
            size={size}
            disabled={deletePending}
          >
            {deletePending ? "Deleting…" : deleteLabel(status)}
          </Button>
        </form>
      </div>

      {deleteState.error ? (
        <p className="mt-2 text-sm text-cub-red-light">{deleteState.error}</p>
      ) : null}
    </div>
  );
}
