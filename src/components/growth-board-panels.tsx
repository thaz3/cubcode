"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { CancelFocusSessionForm } from "@/components/cancel-focus-session-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import type { ActionState } from "@/lib/actions/auth";
import {
  claimBoardTaskByCubAction,
  claimFocusBlockSessionAction,
  claimFocusBlockTemplateAction,
} from "@/lib/actions/growth-board";
import type { GrowthAreaBoard, GrowthBoardView } from "@/lib/growth-board";
import { cubSectionLabel } from "@/lib/cub-theme";
import {
  GROWTH_CATEGORY_LABELS,
  growthCategoryShortLabel,
} from "@/lib/task-categories";
import type { TaskStatus } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

const AREA_ACCENT: Record<GrowthAreaBoard["area"], string> = {
  CONTROL: "border-l-cub-green-bright",
  USE: "border-l-cub-gold",
  BUILD: "border-l-cub-gold-warm",
  CHARACTER: "border-l-cub-green-light",
  WELLNESS: "border-l-cub-off-white",
};

type GrowthBoardPanelsProps = {
  cubId: string;
  board: GrowthBoardView;
  /** focus = start focus sessions only; boards = claim/continue work; all = everything */
  mode?: "all" | "focus" | "boards";
};

export function GrowthBoardPanels({
  cubId,
  board,
  mode = "all",
}: GrowthBoardPanelsProps) {
  const showFocus = mode === "all" || mode === "focus";
  const showBoards = mode === "all" || mode === "boards";

  if (mode === "focus") {
    return (
      <Card className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-cub-off-white">Focus sessions</h2>
          <p className="mt-1 text-sm text-cub-muted">
            Start a focus block in each growth area. One active session per area.
          </p>
        </div>

        {board.swapCredits > 0 ? (
          <p className="rounded-lg border border-cub-green/25 bg-cub-green-muted/20 px-3 py-2 text-sm text-cub-muted">
            <span className="font-medium text-cub-green-light">
              {board.swapCredits} Focus area swap
              {board.swapCredits === 1 ? "" : "s"}
            </span>{" "}
            available.
          </p>
        ) : null}

        <ul className="divide-y divide-cub-charcoal">
          {board.areas.map((areaBoard) => (
            <li key={areaBoard.area} className="space-y-2 py-3 first:pt-0 last:pb-0">
              <p className="text-sm font-semibold text-cub-gold-light">
                {growthCategoryShortLabel(areaBoard.area)}
              </p>
              <FocusBlockLane
                cubId={cubId}
                area={areaBoard.area}
                eligibility={areaBoard.focusEligibility}
                templates={areaBoard.focusTemplates}
                swapCredits={board.swapCredits}
              />
            </li>
          ))}
        </ul>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {showFocus && board.swapCredits > 0 ? (
        <Card variant="constructive" className="text-sm text-cub-muted">
          <span className="font-medium text-cub-green-light">
            {board.swapCredits} Focus area swap
            {board.swapCredits === 1 ? "" : "s"}
          </span>{" "}
          available — use one to claim another focus session in an area you
          already finished this week.
        </Card>
      ) : null}

      {board.areas.map((areaBoard) => (
        <GrowthAreaBoardPanel
          key={areaBoard.area}
          cubId={cubId}
          board={areaBoard}
          swapCredits={board.swapCredits}
          showFocus={showFocus}
          showBoards={showBoards}
        />
      ))}
    </div>
  );
}

function GrowthAreaBoardPanel({
  cubId,
  board,
  swapCredits,
  showFocus,
  showBoards,
  compact = false,
}: {
  cubId: string;
  board: GrowthAreaBoard;
  swapCredits: number;
  showFocus: boolean;
  showBoards: boolean;
  compact?: boolean;
}) {
  const { area, focusEligibility } = board;
  const hasFocusContent =
    showFocus &&
    (focusEligibility.activeTask != null ||
      focusEligibility.canClaim ||
      board.focusTemplates.length > 0);
  const hasBoardContent =
    showBoards &&
    (board.availableToClaim.length > 0 || board.yours.length > 0);
  const hasContent = hasFocusContent || hasBoardContent;

  if (!hasContent && compact) {
    return null;
  }

  return (
    <Card
      className={cn(
        compact ? "space-y-3 p-4" : "space-y-4 border-l-4 pl-4",
        !compact && AREA_ACCENT[area],
      )}
    >
      <div>
        <p className={cubSectionLabel}>{growthCategoryShortLabel(area)}</p>
        {!compact ? (
          <h2 className="text-lg font-semibold text-cub-off-white">
            {GROWTH_CATEGORY_LABELS[area]}
          </h2>
        ) : null}
      </div>

      {showFocus ? (
        <section className="space-y-2">
          {!compact ? (
            <h3 className="text-sm font-medium text-cub-off-white">Focus Block</h3>
          ) : null}
          <FocusBlockLane
            cubId={cubId}
            area={area}
            eligibility={focusEligibility}
            templates={board.focusTemplates}
            swapCredits={swapCredits}
          />
        </section>
      ) : null}

      {showBoards && board.availableToClaim.length > 0 ? (
        <section className="space-y-2">
          <h3 className="text-sm font-medium text-cub-off-white">Claim from board</h3>
          <ul className="space-y-2">
            {board.availableToClaim.map((task) => (
              <BoardTaskRow
                key={task.id}
                cubId={cubId}
                task={task}
                action={claimBoardTaskByCubAction}
                buttonLabel="Claim"
              />
            ))}
          </ul>
        </section>
      ) : null}

      {showBoards && board.yours.length > 0 ? (
        <section className="space-y-2">
          <h3 className="text-sm font-medium text-cub-off-white">Your work</h3>
          <ul className="space-y-2">
            {board.yours.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-cub-charcoal bg-cub-ebony/50 px-3 py-2"
              >
                <span className="text-sm text-cub-off-white">{task.title}</span>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge status={task.status as TaskStatus} />
                  <Link
                    href={`/cub/${cubId}/tasks`}
                    className="text-xs font-medium text-cub-gold-light hover:text-cub-gold-warm"
                  >
                    Open
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!hasContent && !compact ? (
        <p className="text-sm text-cub-muted">
          Nothing on this board yet. Ask your parent to publish tasks tagged with{" "}
          {growthCategoryShortLabel(area)}.
        </p>
      ) : null}
    </Card>
  );
}

function FocusBlockLane({
  cubId,
  area,
  eligibility,
  templates,
  swapCredits,
}: {
  cubId: string;
  area: GrowthAreaBoard["area"];
  eligibility: GrowthAreaBoard["focusEligibility"];
  templates: GrowthAreaBoard["focusTemplates"];
  swapCredits: number;
}) {
  if (eligibility.activeTask) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-cub-green/30 bg-cub-green-muted/20 px-3 py-3">
        <div>
          <p className="text-sm font-medium text-cub-off-white">
            {eligibility.activeTask.title}
          </p>
          <p className="mt-1 text-xs text-cub-muted">Active focus session</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <CancelFocusSessionForm
            cubId={cubId}
            taskId={eligibility.activeTask.id}
          />
          <Link
            href={`/cub/${cubId}/tasks`}
            className="text-sm font-medium text-cub-gold-light hover:text-cub-gold-warm"
          >
            Continue →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <ClaimFocusSessionForm
        cubId={cubId}
        area={area}
        eligibility={eligibility}
        swapCredits={swapCredits}
      />

      {templates.map((task) => (
        <ClaimFocusTemplateForm
          key={task.id}
          cubId={cubId}
          area={area}
          task={task}
          eligibility={eligibility}
          swapCredits={swapCredits}
        />
      ))}
    </div>
  );
}

function ClaimFocusSessionForm({
  cubId,
  area,
  eligibility,
  swapCredits,
}: {
  cubId: string;
  area: GrowthAreaBoard["area"];
  eligibility: GrowthAreaBoard["focusEligibility"];
  swapCredits: number;
}) {
  const [useSwap, setUseSwap] = useState(false);
  const [state, formAction, isPending] = useActionState(
    claimFocusBlockSessionAction,
    {} as ActionState,
  );

  if (!eligibility.canClaim) {
    if (eligibility.needsSwap && swapCredits === 0) {
      return (
        <p className="rounded-lg border border-cub-charcoal bg-cub-ebony/40 px-3 py-2 text-sm text-cub-muted">
          You finished {growthCategoryShortLabel(area)} this week. Ask your parent
          to redeem a Focus area swap from the reward store.
        </p>
      );
    }
    if (eligibility.reason === "spread") {
      return (
        <p className="rounded-lg border border-cub-charcoal bg-cub-ebony/40 px-3 py-2 text-sm text-cub-muted">
          Spread your focus across other growth areas first, or use a swap from
          the reward store.
        </p>
      );
    }
    return null;
  }

  return (
    <form action={formAction} className="rounded-lg border border-cub-charcoal bg-cub-ebony/50 px-3 py-3">
      <input type="hidden" name="cubId" value={cubId} />
      <input type="hidden" name="growthCategory" value={area} />
      {eligibility.needsSwap ? (
        <>
          <input type="hidden" name="confirmSwap" value={useSwap ? "true" : "false"} />
          <label className="flex items-start gap-2 text-sm text-cub-muted">
            <input
              type="checkbox"
              checked={useSwap}
              onChange={(event) => setUseSwap(event.target.checked)}
              className="mt-0.5"
            />
            <span>
              Use 1 Focus area swap ({swapCredits} available) to start another
              session in {growthCategoryShortLabel(area)}.
            </span>
          </label>
        </>
      ) : null}
      {state.error ? (
        <p className="mt-2 text-sm text-cub-red-light">{state.error}</p>
      ) : null}
      <Button
        type="submit"
        variant="constructive"
        size="sm"
        className="mt-3"
        disabled={isPending || (eligibility.needsSwap && !useSwap)}
      >
        {isPending
          ? "Starting..."
          : `Start Focus — ${growthCategoryShortLabel(area)}`}
      </Button>
    </form>
  );
}

function ClaimFocusTemplateForm({
  cubId,
  area,
  task,
  eligibility,
  swapCredits,
}: {
  cubId: string;
  area: GrowthAreaBoard["area"];
  task: GrowthAreaBoard["focusTemplates"][number];
  eligibility: GrowthAreaBoard["focusEligibility"];
  swapCredits: number;
}) {
  const [useSwap, setUseSwap] = useState(false);
  const [state, formAction, isPending] = useActionState(
    claimFocusBlockTemplateAction,
    {} as ActionState,
  );

  if (!eligibility.canClaim) {
    return null;
  }

  return (
    <form
      action={formAction}
      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-cub-charcoal bg-cub-ebony/40 px-3 py-2"
    >
      <input type="hidden" name="cubId" value={cubId} />
      <input type="hidden" name="taskId" value={task.id} />
      <input type="hidden" name="growthCategory" value={area} />
      {eligibility.needsSwap ? (
        <>
          <input type="hidden" name="confirmSwap" value={useSwap ? "true" : "false"} />
          <label className="flex w-full items-start gap-2 text-xs text-cub-muted">
            <input
              type="checkbox"
              checked={useSwap}
              onChange={(event) => setUseSwap(event.target.checked)}
              className="mt-0.5"
            />
            <span>Use 1 swap ({swapCredits} available)</span>
          </label>
        </>
      ) : null}
      <span className="text-sm text-cub-off-white">{task.title}</span>
      <div className="flex flex-col items-end gap-1">
        {state.error ? (
          <p className="text-xs text-cub-red-light">{state.error}</p>
        ) : null}
        <Button
          type="submit"
          variant="constructive"
          size="sm"
          disabled={isPending || (eligibility.needsSwap && !useSwap)}
        >
          {isPending ? "Starting..." : "Start focus block"}
        </Button>
      </div>
    </form>
  );
}

function BoardTaskRow({
  cubId,
  task,
  action,
  buttonLabel,
}: {
  cubId: string;
  task: GrowthAreaBoard["availableToClaim"][number];
  action: typeof claimBoardTaskByCubAction;
  buttonLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, {} as ActionState);

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-cub-charcoal bg-cub-ebony/40 px-3 py-2">
      <span className="text-sm text-cub-off-white">{task.title}</span>
      <div className="flex flex-col items-end gap-1">
        {state.error ? (
          <p className="text-xs text-cub-red-light">{state.error}</p>
        ) : null}
        <form action={formAction}>
          <input type="hidden" name="cubId" value={cubId} />
          <input type="hidden" name="taskId" value={task.id} />
          <Button type="submit" variant="reward" size="sm" disabled={isPending}>
            {isPending ? "Claiming..." : buttonLabel}
          </Button>
        </form>
      </div>
    </li>
  );
}
