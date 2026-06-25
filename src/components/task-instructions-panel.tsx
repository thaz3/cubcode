import { ChecklistItemContent } from "@/components/checklist-item-content";
import { formatProofType } from "@/lib/task-labels";
import { getTaskChecklistItems } from "@/lib/tasks";
import type { Task, TaskProofType } from "@/generated/prisma/client";

type TaskInstructionsPanelProps = {
  task: Pick<
    Task,
    "description" | "proofPrompt" | "proofType" | "proofChecklistItems"
  >;
};

export function TaskInstructionsPanel({ task }: TaskInstructionsPanelProps) {
  const checklistItems = getTaskChecklistItems(task);
  const hasContent =
    Boolean(task.description?.trim()) ||
    Boolean(task.proofPrompt?.trim()) ||
    (task.proofType === "CHECKLIST" && checklistItems.length > 0);

  if (!hasContent) {
    return (
      <div className="rounded-xl border border-cub-green/30 bg-cub-green-muted px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-cub-green-light">
          Instructions
        </p>
        <p className="mt-2 text-sm text-zinc-400">
          No extra instructions — do the task, then submit when you&apos;re done.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-cub-green/30 bg-cub-green-muted px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-cub-green-light">
        Instructions
      </p>

      {task.description ? (
        <p className="whitespace-pre-wrap text-sm text-zinc-200">{task.description}</p>
      ) : null}

      {task.proofPrompt ? (
        <div>
          <p className="text-xs font-medium text-zinc-500">
            {proofInstructionLabel(task.proofType)}
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-300">
            {task.proofPrompt}
          </p>
        </div>
      ) : null}

      {task.proofType === "CHECKLIST" && checklistItems.length > 0 ? (
        <ul className="space-y-1.5 text-sm text-zinc-400">
          {checklistItems.map((item, index) => (
            <li key={`${index}-${item}`} className="flex gap-2">
              <span className="shrink-0 text-zinc-600">{index + 1}.</span>
              <span className="min-w-0 flex-1">
                <ChecklistItemContent content={item} />
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function proofInstructionLabel(proofType: TaskProofType): string {
  if (proofType === "PARENT_APPROVAL") {
    return "What to do";
  }
  return formatProofType(proofType);
}
