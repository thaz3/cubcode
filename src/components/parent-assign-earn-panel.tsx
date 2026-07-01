"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChallengeForm } from "@/components/challenge-form";
import { CreateOneOffTaskForm } from "@/components/create-one-off-task-form";
import { ParentBonusXpForm } from "@/components/parent-bonus-xp-form";
import { EarnTypeBadge } from "@/components/earn-type-badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Cub, GrowthCategory } from "@/generated/prisma/client";
import {
  EARN_TYPES,
  getEarnTypeMeta,
  parseParentAssignKind,
  type EarnType,
} from "@/lib/earn-types";
import { cubRewardFields } from "@/lib/cub-task-fields";
import { NATIVE_SELECT_CLASS } from "@/lib/mobile-form-styles";
import { touchDebug, logFormSubmit } from "@/lib/touch-debug";
import { cn } from "@/lib/utils";
import { useTouchNativeControls } from "@/components/use-prefers-hover";

export type ParentAssignKind = EarnType;

type GrowthOption = {
  value: GrowthCategory;
  label: string;
};

type ParentAssignEarnPanelProps = {
  cubs: Cub[];
  defaultKind?: ParentAssignKind;
  defaultCubId?: string;
  compact?: boolean;
  bonusGrowthOptions?: GrowthOption[];
};

export function ParentAssignEarnPanel({
  cubs,
  defaultKind = "task",
  defaultCubId,
  compact = false,
  bonusGrowthOptions = [],
}: ParentAssignEarnPanelProps) {
  const [kind, setKind] = useState<ParentAssignKind>(
    parseParentAssignKind(defaultKind),
  );
  const cubName = defaultCubId
    ? cubs.find((c) => c.id === defaultCubId)?.displayName
    : undefined;
  const defaultCub = defaultCubId
    ? cubs.find((c) => c.id === defaultCubId)
    : undefined;
  const defaultRewards = defaultCub ? cubRewardFields(defaultCub) : undefined;
  const useNativeControls = useTouchNativeControls();

  function selectKind(next: ParentAssignKind) {
    touchDebug("Assign earn type", { kind: next });
    setKind(next);
  }

  useEffect(() => {
    if (kind === "task") {
      touchDebug("Create Task panel open", { compact, cubId: defaultCubId });
      logFormSubmit("task", { phase: "panel-open" });
    } else if (kind === "routine") {
      touchDebug("Create Routine panel open", { cubId: defaultCubId });
      logFormSubmit("routine", { phase: "panel-open" });
    }
  }, [kind, compact, defaultCubId]);

  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      <div className="space-y-3">
        <div>
          <h3 className="text-base font-semibold text-cub-off-white">
            What do you want to assign?
          </h3>
          <p className="mt-1 text-sm text-cub-muted">
            Choose an earn type, then fill in the details below.
          </p>
        </div>

        {useNativeControls ? (
          <div className="space-y-1.5">
            <Label htmlFor="parent-earn-type">Assignment type</Label>
            <select
              id="parent-earn-type"
              value={kind}
              onChange={(event) =>
                selectKind(parseParentAssignKind(event.target.value))
              }
              className={NATIVE_SELECT_CLASS}
            >
              {EARN_TYPES.map((earnType) => {
                const meta = getEarnTypeMeta(earnType);
                return (
                  <option key={earnType} value={earnType}>
                    {meta.label} — {meta.explanation}
                  </option>
                );
              })}
            </select>
          </div>
        ) : (
          <div
            role="radiogroup"
            aria-label="Choose earn type"
            className="grid gap-2 lg:grid-cols-3"
          >
            {EARN_TYPES.map((earnType) => {
              const meta = getEarnTypeMeta(earnType);
              const selected = kind === earnType;

              return (
                <button
                  key={earnType}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => selectKind(earnType)}
                  className={cn(
                    "min-h-11 touch-manipulation rounded-xl border p-3 text-left transition-colors active:scale-[0.98]",
                    selected
                      ? cn(meta.cardBorderClass, "bg-cub-charcoal ring-1 ring-cub-gold/30")
                      : "border-cub-off-white/10 bg-cub-ebony hover:border-cub-off-white/20 active:bg-cub-charcoal",
                  )}
                >
                  <EarnTypeBadge earnType={earnType} />
                  <p className="mt-2 text-sm font-semibold text-cub-off-white">
                    {meta.label}
                  </p>
                  <p className="mt-1 text-xs text-cub-muted line-clamp-2">
                    {meta.explanation}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div
        key={kind}
        role="tabpanel"
        className="rounded-xl border border-cub-off-white/10 bg-cub-ebony/40 p-4"
      >
        {kind === "task" ? (
          cubs.length === 0 ? (
            <p className="text-sm text-cub-muted">
              Add a Cub profile before creating a task.
            </p>
          ) : (
            <CreateOneOffTaskForm
              cubs={cubs}
              defaultCubId={defaultCubId}
              defaultRewards={defaultRewards}
              compact={compact}
            />
          )
        ) : null}

        {kind === "routine" ? (
          cubs.length === 0 ? (
            <p className="text-sm text-cub-muted">
              Add a Cub profile before creating a repeating routine.
            </p>
          ) : (
            <ChallengeForm
              cubs={cubs}
              defaultCubId={defaultCubId}
              submitLabel={
                defaultCubId
                  ? `Create routine for ${cubName ?? "Cub"}`
                  : "Create routine"
              }
            />
          )
        ) : null}

        {kind === "growth_pick" ? (
          <AssignEarnTypeRedirect
            earnType="growth_pick"
            cubId={defaultCubId}
            cubName={cubName}
          />
        ) : null}

        {kind === "training_path" ? (
          <AssignEarnTypeRedirect
            earnType="training_path"
            cubId={defaultCubId}
            cubName={cubName}
          />
        ) : null}

        {kind === "bonus" ? (
          defaultCubId && bonusGrowthOptions.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-cub-muted">
                Award bonus XP to {cubName ?? "this Cub"} for effort, maturity,
                or something worth celebrating.
              </p>
              <ParentBonusXpForm
                cubId={defaultCubId}
                growthOptions={bonusGrowthOptions}
              />
            </div>
          ) : (
            <AssignEarnTypeRedirect earnType="bonus" cubId={defaultCubId} cubName={cubName} />
          )
        ) : null}
      </div>
    </div>
  );
}

function AssignEarnTypeRedirect({
  earnType,
  cubId,
  cubName,
}: {
  earnType: Exclude<EarnType, "task" | "routine">;
  cubId?: string;
  cubName?: string;
}) {
  const meta = getEarnTypeMeta(earnType);
  const href =
    earnType === "bonus" && cubId
      ? `/dashboard/cubs/${cubId}/tasks#bonus`
      : meta.parentCtaHref;

  return (
    <div className="space-y-4">
      <p className="text-sm text-cub-off-white/90">{meta.purpose}</p>
      <ul className="space-y-1 text-sm text-cub-muted">
        {meta.examples.slice(0, 4).map((example) => (
          <li key={example}>· {example}</li>
        ))}
      </ul>
      <Link href={href}>
        <Button fullWidth size="lg">
          {cubName ? `${meta.ctaLabel} for ${cubName}` : meta.ctaLabel}
        </Button>
      </Link>
    </div>
  );
}

/** @deprecated Use ParentAssignEarnPanel */
export type ParentCreateKind = "task" | "challenge";

/** @deprecated Use ParentAssignEarnPanel */
export function ParentCreateWorkPanel(
  props: Omit<ParentAssignEarnPanelProps, "defaultKind"> & {
    defaultKind?: ParentCreateKind;
    showExplainer?: boolean;
  },
) {
  const mappedKind: ParentAssignKind =
    props.defaultKind === "challenge" ? "routine" : "task";

  return (
    <ParentAssignEarnPanel
      cubs={props.cubs}
      defaultCubId={props.defaultCubId}
      compact={props.compact}
      defaultKind={mappedKind}
      bonusGrowthOptions={props.bonusGrowthOptions}
    />
  );
}
