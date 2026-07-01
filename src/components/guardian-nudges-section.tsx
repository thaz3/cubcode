"use client";

import Link from "next/link";
import { GuardianNudgeDismissButton } from "@/components/guardian-nudge-dismiss-button";
import { GuardianNudgeSeenButton } from "@/components/guardian-nudge-seen-button";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import type { GuardianNudge, GuardianNudgeRuleType } from "@/generated/prisma/client";
import { TaskUrgentBadge } from "@/components/task-urgent-badge";
import { isGuardianNudgeDismissAllowed } from "@/lib/guardian-nudges/rule-state";
import { SMALL_REMINDERS_LABEL } from "@/lib/small-reminders-labels";
import { cubLink } from "@/lib/cub-theme";
import { cn } from "@/lib/utils";

type NudgeWithRelations = GuardianNudge & {
  task: { id: string; title: string; status: string; isUrgent: boolean } | null;
  cub: { id: string; displayName: string } | null;
};

function nudgeHref(nudge: NudgeWithRelations): string {
  if (nudge.type === "DAILY_SUMMARY") {
    return "/dashboard/tasks#waiting-to-start";
  }
  if (nudge.task?.status === "SUBMITTED") {
    return `/dashboard/tasks/review/${nudge.task.id}`;
  }
  if (nudge.taskId) {
    return `/dashboard/tasks/${nudge.taskId}`;
  }
  return "/dashboard/tasks";
}

function nudgeLabel(type: GuardianNudgeRuleType): string {
  switch (type) {
    case "NOT_TOUCHED_AFTER_ASSIGN":
      return "No action";
    case "NOT_STARTED_BEFORE_DUE":
      return "Due soon";
    case "OVERDUE_NOT_STARTED":
      return "Overdue";
    case "SUBMITTED_FOR_REVIEW":
      return "Review";
    case "DAILY_SUMMARY":
      return "Summary";
    default:
      return "Nudge";
  }
}

const NUDGE_BADGE: Record<GuardianNudgeRuleType, string> = {
  SUBMITTED_FOR_REVIEW:
    "bg-cub-gold-muted text-cub-gold-light ring-cub-gold/40",
  OVERDUE_NOT_STARTED:
    "bg-cub-red-muted text-cub-off-white ring-cub-red/45",
  NOT_STARTED_BEFORE_DUE:
    "bg-cub-gold-muted text-cub-gold-light ring-cub-gold/35",
  NOT_TOUCHED_AFTER_ASSIGN:
    "bg-cub-charcoal text-cub-muted ring-cub-off-white/15",
  DAILY_SUMMARY:
    "bg-cub-gold-muted text-cub-gold-light ring-cub-gold/50",
};

type FocusSessionReminder = {
  id: string;
  title: string;
  cubId: string | null;
  cubName: string | null;
  href: string;
};

type FocusDeckReminder = {
  id: string;
  title: string;
  cubName: string;
  href: string;
};

type GuardianNudgesSectionProps = {
  nudges: NudgeWithRelations[];
  focusSessions?: FocusSessionReminder[];
  focusDeckCards?: FocusDeckReminder[];
  hiddenByQuietHours?: boolean;
};

function getRemindersSummary(
  nudges: NudgeWithRelations[],
  focusSessions: FocusSessionReminder[],
  focusDeckCards: FocusDeckReminder[],
): string {
  if (focusSessions.length > 0) {
    return `${focusSessions.length} focus session${focusSessions.length === 1 ? "" : "s"} running`;
  }
  if (nudges.length > 0) {
    return nudges[0]!.message;
  }
  if (focusDeckCards.length > 0) {
    return `${focusDeckCards.length} Growth Pick${focusDeckCards.length === 1 ? "" : "s"} started this week`;
  }
  return "Nothing right now";
}

export function GuardianNudgesSection({
  nudges,
  focusSessions = [],
  focusDeckCards = [],
  hiddenByQuietHours = false,
}: GuardianNudgesSectionProps) {
  const hasFocus = focusSessions.length > 0;
  const hasFocusDeck = focusDeckCards.length > 0;
  const hasNudges = nudges.length > 0;

  if (!hasFocus && !hasFocusDeck && !hasNudges) {
    return null;
  }

  const unseenCount =
    nudges.filter((nudge) => nudge.status === "ACTIVE").length +
    focusSessions.length +
    focusDeckCards.length;

  const itemCount =
    (hiddenByQuietHours ? 0 : nudges.length) +
    focusSessions.length +
    focusDeckCards.length;

  return (
    <section id="small-reminders" className="scroll-mt-36">
      <CollapsibleSection
        title={SMALL_REMINDERS_LABEL}
        summary={getRemindersSummary(nudges, focusSessions, focusDeckCards)}
        badge={itemCount > 0 ? itemCount : undefined}
        defaultOpen={unseenCount > 0}
        className="border-cub-red-alert/35 border-l-4 border-l-cub-red-alert cub-card-red bg-cub-charcoal shadow-md shadow-cub-red/10"
      >
        {hiddenByQuietHours && hasNudges ? (
          <p className="mb-3 rounded-lg border border-cub-off-white/10 bg-cub-ebony px-3 py-2 text-sm text-cub-muted">
            {nudges.length} reminder{nudges.length === 1 ? "" : "s"} hidden during
            quiet hours.
          </p>
        ) : null}

        <ul className="space-y-2">
          {focusSessions.map((session) => (
            <li key={`focus-${session.id}`}>
              <ReminderRow
                badgeLabel="Focus"
                badgeClass="bg-cub-green-muted text-cub-green-light ring-cub-green-bright/45"
                message={session.title}
                detail={
                  session.cubName
                    ? `${session.cubName} · timer running`
                    : "Timer running"
                }
                href={session.href}
                hrefLabel="Continue"
              />
            </li>
          ))}

          {focusDeckCards.map((card) => (
            <li key={`focus-deck-${card.id}`}>
              <ReminderRow
                badgeLabel="Growth Pick"
                badgeClass="bg-cub-gold-muted text-cub-gold-light ring-cub-gold/45"
                message={card.title}
                detail={card.cubName}
                href={card.href}
                hrefLabel="View"
              />
            </li>
          ))}

          {hiddenByQuietHours
            ? null
            : nudges.map((nudge) => {
                const isNew = nudge.status === "ACTIVE";
                const reviewCta = nudge.type === "SUBMITTED_FOR_REVIEW";

                return (
                  <li key={nudge.id}>
                    <div
                      className={cn(
                        "flex flex-col gap-2 rounded-lg border border-cub-charcoal bg-cub-ebony px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between",
                        isNew && "border-cub-red-alert/40",
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1",
                              NUDGE_BADGE[nudge.type],
                            )}
                          >
                            {nudgeLabel(nudge.type)}
                          </span>
                          {nudge.task?.isUrgent ? <TaskUrgentBadge /> : null}
                        </div>
                        <p className="mt-1 text-sm leading-snug text-cub-off-white">
                          {nudge.message}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                        <Link
                          href={nudgeHref(nudge)}
                          className={cn(
                            "text-sm font-medium",
                            reviewCta ? "text-cub-gold-light" : cubLink,
                          )}
                        >
                          {reviewCta ? "Review" : "View"} →
                        </Link>
                        {isNew ? (
                          <GuardianNudgeSeenButton nudgeId={nudge.id} />
                        ) : null}
                        {isGuardianNudgeDismissAllowed(nudge.type) ? (
                          <GuardianNudgeDismissButton nudgeId={nudge.id} compact />
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })}
        </ul>
      </CollapsibleSection>
    </section>
  );
}

function ReminderRow({
  badgeLabel,
  badgeClass,
  message,
  detail,
  href,
  hrefLabel,
}: {
  badgeLabel: string;
  badgeClass: string;
  message: string;
  detail?: string;
  href: string;
  hrefLabel: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-cub-charcoal bg-cub-ebony px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <span
          className={cn(
            "inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1",
            badgeClass,
          )}
        >
          {badgeLabel}
        </span>
        <p className="mt-1 text-sm font-medium text-cub-off-white">{message}</p>
        {detail ? (
          <p className="text-xs text-cub-muted">{detail}</p>
        ) : null}
      </div>
      <Link href={href} className={cn("shrink-0 text-sm font-medium", cubLink)}>
        {hrefLabel} →
      </Link>
    </div>
  );
}
