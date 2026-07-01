"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChecklistItemContent } from "@/components/checklist-item-content";
import { ProofLinkHelp } from "@/components/proof-link-help";
import { Label } from "@/components/ui/label";
import { OverduePenaltyNotice } from "@/components/overdue-penalty-notice";
import type { ActionState } from "@/lib/actions/auth";
import { logFocusBlockAction, submitTaskAction } from "@/lib/actions/tasks";
import { getTaskChecklistItems } from "@/lib/tasks";
import {
  formatProofType,
  formatTaskRewards,
  getCubVisibleChecklistItems,
  resolveCubProofSubmissionType,
} from "@/lib/task-labels";
import {
  getCategorySuggestions,
  GROWTH_CATEGORY_LABELS,
} from "@/lib/task-categories";
import { isPastDueAt } from "@/lib/task-rewards";
import { cn } from "@/lib/utils";
import type { GrowthCategory, Task } from "@/generated/prisma/client";
import { useActionState } from "react";

type TaskSubmitFormProps = {
  task: Pick<
    Task,
    | "id"
    | "proofType"
    | "title"
    | "proofPrompt"
    | "proofChecklistItems"
    | "category"
    | "subcategory"
    | "growthCategory"
    | "status"
    | "dueAt"
    | "dueAtHasTime"
    | "xpEarned"
    | "focusTokensEarned"
    | "phoneMinutesEarned"
    | "focusMinutesEarned"
  >;
  audience?: "parent" | "cub";
  compact?: boolean;
};

export function TaskSubmitForm({
  task,
  audience = "parent",
  compact = false,
}: TaskSubmitFormProps) {
  const [state, formAction, isPending] = useActionState(submitTaskAction, {});
  const logHint = getCategorySuggestions(task.category, {
    subcategory: task.subcategory,
    growthCategory: task.growthCategory,
  }).logInstructions;
  const overdue = isPastDueAt(task, new Date());
  const isCubView = audience === "cub";
  const storedChecklistItems = getTaskChecklistItems(task);
  const cubProofType = isCubView
    ? resolveCubProofSubmissionType(task.proofType, storedChecklistItems)
    : task.proofType;
  const showProofTypeLabel = !isCubView;

  return (
    <form
      action={formAction}
      className={cn(
        "border-t border-zinc-200 dark:border-cub-off-white/10",
        compact ? "mt-3 space-y-2 border-t pt-3" : "space-y-4 pt-4",
      )}
    >
      <input type="hidden" name="taskId" value={task.id} />
      <h3 className={cn("font-medium", compact && "text-sm")}>Submit proof</h3>
      {overdue ? <OverduePenaltyNotice /> : null}
      {!compact ? (
        <>
          {showProofTypeLabel ? (
            <p className="text-sm text-zinc-500">
              {formatProofType(isCubView ? cubProofType : task.proofType)}
            </p>
          ) : null}
          {!isCubView ? (
            <p className="rounded-lg bg-amber-50/60 p-2 text-sm text-zinc-600 dark:bg-amber-950/30 dark:text-zinc-400">
              {logHint}
            </p>
          ) : null}
          {!isCubView ? (
            <p className="text-sm text-zinc-500">
              On approval: {formatTaskRewards(task)}
            </p>
          ) : null}
          {!isCubView || cubProofType !== "PARENT_APPROVAL" ? (
            <p className="text-sm text-zinc-500">
              {isCubView
                ? "Your parent approves work before you earn rewards."
                : "Parent approval is required to earn XP, Focus Tokens, focus minutes, and phone time."}
            </p>
          ) : null}
        </>
      ) : !isCubView ? (
        <p className="text-xs text-zinc-500">{logHint}</p>
      ) : null}

      <ProofFields
        task={task}
        audience={audience}
        compact={compact}
        proofType={isCubView ? cubProofType : task.proofType}
        checklistItems={
          isCubView
            ? getCubVisibleChecklistItems(storedChecklistItems)
            : storedChecklistItems
        }
      />

      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state.success ? (
        <p className="text-sm text-green-700">{state.success}</p>
      ) : null}

      <Button
        type="submit"
        variant="reward"
        fullWidth
        size={compact ? "md" : "lg"}
        disabled={isPending}
      >
        {isPending ? "Submitting..." : "Submit for review"}
      </Button>
    </form>
  );
}

function ProofFields({
  task,
  audience = "parent",
  compact = false,
  proofType = task.proofType,
  checklistItems = getTaskChecklistItems(task),
}: {
  task: TaskSubmitFormProps["task"];
  audience?: "parent" | "cub";
  compact?: boolean;
  proofType?: Task["proofType"];
  checklistItems?: string[];
}) {
  if (task.proofPrompt && audience !== "cub") {
    return (
      <div className={compact ? "space-y-2" : "space-y-4"}>
        <div
          className={cn(
            "rounded-lg bg-zinc-50 text-sm dark:bg-zinc-900",
            compact ? "p-2" : "p-3",
          )}
        >
          <p className="font-medium text-zinc-800 dark:text-zinc-200">
            Instructions
          </p>
          <p
            className={cn(
              "whitespace-pre-wrap text-zinc-600 dark:text-zinc-400",
              compact ? "mt-0.5 text-xs" : "mt-1",
            )}
          >
            {task.proofPrompt}
          </p>
        </div>
        <ProofInput
          proofType={proofType}
          category={task.category}
          checklistItems={checklistItems}
          audience={audience}
        />
      </div>
    );
  }

  return (
    <ProofInput
      proofType={proofType}
      checklistItems={checklistItems}
      audience={audience}
    />
  );
}

function ProofInput({
  proofType,
  category,
  checklistItems,
  audience = "parent",
}: {
  proofType: Task["proofType"];
  category?: Task["category"];
  checklistItems: string[];
  audience?: "parent" | "cub";
}) {
  if (category === "FOCUS_BLOCK") {
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="reflection">
            {audience === "cub" ? "What did you focus on?" : "Cub's reflection"}
          </Label>
          <textarea
            id="reflection"
            name="reflection"
            rows={4}
            required
            minLength={10}
            className="w-full min-h-11 rounded-xl border border-zinc-700 bg-cub-ebony px-4 py-2.5 text-base text-zinc-100 outline-none ring-cub-gold focus:ring-2"
            placeholder={
              audience === "cub"
                ? "Describe what you worked on and what you learned…"
                : "Type the Cub's reflection here (parent-supervised)…"
            }
          />
        </div>
        <div>
          <Label htmlFor="proofLink">
            {audience === "cub" ? "Paste your proof link" : "Proof link"}
          </Label>
          <Input
            id="proofLink"
            name="proofLink"
            type="text"
            inputMode="url"
            autoComplete="url"
            required
            placeholder="https://…"
          />
          <ProofLinkHelp audience={audience} variant="focus" />
        </div>
      </div>
    );
  }

  if (proofType === "PARENT_APPROVAL") {
    return (
      <div>
        <Label htmlFor="reflection">Notes (optional)</Label>
        <textarea
          id="reflection"
          name="reflection"
          rows={3}
          className="w-full rounded-xl border border-zinc-700 bg-cub-ebony px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none ring-cub-gold focus:ring-2"
          placeholder={
            audience === "cub"
              ? "Anything you want your parent to know (optional)…"
              : "Optional note about completed work (parent-supervised)…"
          }
        />
      </div>
    );
  }

  if (proofType === "SHORT_REFLECTION") {
    return (
      <div>
        <Label htmlFor="reflection">
          {audience === "cub" ? "Your reflection" : "Cub's reflection"}
        </Label>
        <textarea
          id="reflection"
          name="reflection"
          rows={4}
          required
          minLength={10}
          className="w-full min-h-11 rounded-xl border border-zinc-700 bg-cub-ebony px-4 py-2.5 text-base text-zinc-100 outline-none ring-cub-gold focus:ring-2"
          placeholder={
            audience === "cub"
              ? "What did you do? What did you learn?"
              : "Type the Cub's answer here (parent-supervised)…"
          }
        />
      </div>
    );
  }

  if (proofType === "TIME_LOG") {
    return (
      <div>
        <Label htmlFor="timeLoggedMinutes">Minutes spent</Label>
        <Input
          id="timeLoggedMinutes"
          name="timeLoggedMinutes"
          type="number"
          min={1}
          required
        />
      </div>
    );
  }

  if (proofType === "CHECKLIST") {
    return (
      <div className="max-h-96 space-y-2 overflow-y-auto rounded-lg border border-zinc-200 p-3 dark:border-cub-off-white/10">
        <p className="text-xs text-zinc-500">
          {checklistItems.length} item{checklistItems.length === 1 ? "" : "s"} —
          check each one before submitting.
        </p>
        {checklistItems.map((item, index) => (
          <label
            key={`${index}-${item}`}
            className="flex items-start gap-2 text-sm"
          >
            <input type="checkbox" name={`checklistItem${index}`} className="mt-1 shrink-0" />
            <span className="min-w-0 flex-1 break-words">
              <ChecklistItemContent content={item} />
            </span>
          </label>
        ))}
      </div>
    );
  }

  if (proofType === "PERFORMANCE_VIDEO" || proofType === "SLIDESHOW") {
    const variant =
      proofType === "PERFORMANCE_VIDEO" ? "video" : "slideshow";

    return (
      <div className="space-y-3">
        <div>
          <Label htmlFor="proofLink">
            {audience === "cub" ? "Paste your share link" : "Share link"}
          </Label>
          <Input
            id="proofLink"
            name="proofLink"
            type="text"
            inputMode="url"
            autoComplete="url"
            required
            placeholder="https://…"
          />
          <ProofLinkHelp audience={audience} variant={variant} />
        </div>
        <div>
          <Label htmlFor="reflection">Notes (optional)</Label>
          <textarea
            id="reflection"
            name="reflection"
            rows={2}
            className="w-full rounded-xl border border-zinc-700 bg-cub-ebony px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none ring-cub-gold focus:ring-2"
            placeholder={
              audience === "cub"
                ? "Anything else your parent should know (optional)…"
                : "Optional note about the upload"
            }
          />
        </div>
      </div>
    );
  }

  return null;
}

type FocusBlockFormProps = {
  cubId: string;
  taskId?: string;
  defaultDurationMinutes?: number;
  growthCategory?: GrowthCategory | null;
  showFocusBlockLog?: boolean;
};

export function FocusBlockForm({
  cubId,
  taskId,
  defaultDurationMinutes,
  growthCategory,
  showFocusBlockLog = true,
}: FocusBlockFormProps) {
  if (!showFocusBlockLog) {
    return null;
  }

  const [state, formAction, isPending] = useActionState(
    logFocusBlockAction,
    {} as ActionState,
  );
  const now = new Date();
  const localValue = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  return (
    <form action={formAction} className="space-y-3 border-t border-zinc-200 pt-4 dark:border-cub-off-white/10">
      <input type="hidden" name="cubId" value={cubId} />
      {taskId ? <input type="hidden" name="taskId" value={taskId} /> : null}
      <h3 className="font-medium">Log Focus Block</h3>
      {growthCategory ? (
        <p className="text-sm text-zinc-500">
          Growth area: {GROWTH_CATEGORY_LABELS[growthCategory]}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="durationMinutes">Duration (minutes)</Label>
          <Input
            id="durationMinutes"
            name="durationMinutes"
            type="number"
            min={1}
            required
            defaultValue={defaultDurationMinutes ?? undefined}
          />
        </div>
        <div>
          <Label htmlFor="startedAt">Started at</Label>
          <Input
            id="startedAt"
            name="startedAt"
            type="datetime-local"
            defaultValue={localValue}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="note">Note (optional)</Label>
        <Input id="note" name="note" />
      </div>

      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state.success ? (
        <p className="text-sm text-green-700">{state.success}</p>
      ) : null}

      <Button type="submit" variant="secondary" disabled={isPending}>
        {isPending ? "Logging..." : "Log Focus Block"}
      </Button>
    </form>
  );
}
