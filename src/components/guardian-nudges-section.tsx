import Link from "next/link";
import { GuardianNudgeDismissButton } from "@/components/guardian-nudge-dismiss-button";
import { GuardianNudgeSeenButton } from "@/components/guardian-nudge-seen-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { GuardianNudge, GuardianNudgeRuleType } from "@/generated/prisma/client";
import { TaskUrgentBadge } from "@/components/task-urgent-badge";
import { isGuardianNudgeDismissAllowed } from "@/lib/guardian-nudges/rule-state";
import { SMALL_REMINDERS_LABEL } from "@/lib/small-reminders-labels";
import { cubLink, cubNudgeCard, cubNudgeHeader, cubSectionTitle } from "@/lib/cub-theme";
import { cn } from "@/lib/utils";

type NudgeWithRelations = GuardianNudge & {
  task: { id: string; title: string; status: string; isUrgent: boolean } | null;
  cub: { id: string; displayName: string } | null;
};

function nudgeHref(nudge: NudgeWithRelations): string {
  if (nudge.type === "DAILY_SUMMARY") {
    return "/dashboard";
  }
  if (nudge.task?.status === "SUBMITTED") {
    return `/dashboard/tasks/review/${nudge.task.id}`;
  }
  if (nudge.taskId) {
    return `/dashboard/tasks/${nudge.taskId}`;
  }
  return "/dashboard";
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

const FOCUS_BADGE =
  "bg-cub-green-muted text-cub-green-light ring-cub-green-bright/45";

const FOCUS_DECK_BADGE =
  "bg-cub-gold-muted text-cub-gold-light ring-cub-gold/45";

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

  return (
    <section id="small-reminders" className="scroll-mt-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className={cubSectionTitle}>{SMALL_REMINDERS_LABEL}</h2>
          {unseenCount > 0 ? (
            <span className="rounded-full bg-cub-red-muted px-2.5 py-0.5 text-xs font-bold text-cub-off-white ring-1 ring-cub-red/40">
              {unseenCount} new
            </span>
          ) : null}
        </div>
        <Link
          href="/dashboard/family/settings"
          className={cn("text-sm font-medium", cubLink)}
        >
          Settings →
        </Link>
      </div>

      <Card className="overflow-hidden border-cub-red-alert/30 bg-cub-charcoal p-0 shadow-lg shadow-cub-red/15 ring-1 ring-cub-red/20">
        <div
          className={cn(
            "flex flex-wrap items-start gap-3 px-5 py-4",
            cubNudgeHeader,
          )}
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {unseenCount > 0 ? (
                <span
                  className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-cub-red"
                  aria-hidden
                />
              ) : null}
              <p className="text-sm text-cub-muted">
                A quick heads-up — you decide what happens next.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 p-4">
          {hiddenByQuietHours && hasNudges ? (
            <div className={cn("rounded-xl px-4 py-4", cubNudgeCard)}>
              <p className="text-sm font-medium text-cub-off-white">
                {nudges.length} nudge{nudges.length === 1 ? "" : "s"} waiting
              </p>
              <p className="mt-1 text-sm text-cub-muted">
                Quiet hours are on. Nudges will appear here when quiet hours end.
                Review and tasks are not affected.
              </p>
            </div>
          ) : null}

          <ul className="space-y-3">
            {focusSessions.map((session) => (
              <li key={`focus-${session.id}`}>
                <div
                  className={cn(
                    "rounded-xl border-l-4 border-l-cub-green-bright p-4 shadow-sm",
                    "border border-cub-green/30 bg-cub-green-muted/15 ring-1 ring-cub-green/20",
                  )}
                >
                  <div className="space-y-2">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1",
                        FOCUS_BADGE,
                      )}
                    >
                      Focus
                    </span>
                    <p className="text-base font-medium leading-snug text-cub-off-white">
                      {session.title}
                    </p>
                    {session.cubName ? (
                      <p className="text-sm text-cub-muted">{session.cubName}</p>
                    ) : null}
                    <p className="text-sm text-cub-green-light">
                      Request timer running — check in when they submit.
                    </p>
                  </div>
                  <div className="mt-4">
                    <Link href={session.href}>
                      <Button size="sm" variant="constructive">
                        Continue task
                      </Button>
                    </Link>
                  </div>
                </div>
              </li>
            ))}

            {focusDeckCards.map((card) => (
              <li key={`focus-deck-${card.id}`}>
                <div
                  className={cn(
                    "rounded-xl border-l-4 border-l-cub-gold p-4 shadow-sm",
                    "border border-cub-gold/30 bg-cub-gold-muted/15 ring-1 ring-cub-gold/20",
                  )}
                >
                  <div className="space-y-2">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1",
                        FOCUS_DECK_BADGE,
                      )}
                    >
                      Focus Decks
                    </span>
                    <p className="text-base font-medium leading-snug text-cub-off-white">
                      {card.title}
                    </p>
                    <p className="text-sm text-cub-muted">{card.cubName}</p>
                    <p className="text-sm text-cub-gold-light">
                      Started a new Focus Deck card this week.
                    </p>
                  </div>
                  <div className="mt-4">
                    <Link href={card.href}>
                      <Button size="sm" variant="reward">
                        View Focus Decks
                      </Button>
                    </Link>
                  </div>
                </div>
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
                        "rounded-xl p-4 shadow-sm",
                        cubNudgeCard,
                        isNew && "ring-1 ring-cub-red/30",
                      )}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 space-y-2">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1",
                              NUDGE_BADGE[nudge.type],
                            )}
                          >
                            {nudgeLabel(nudge.type)}
                          </span>
                          {nudge.task?.isUrgent ? <TaskUrgentBadge /> : null}
                          <p className="text-base font-medium leading-snug text-cub-off-white">
                            {nudge.message}
                          </p>
                        </div>
                        {isGuardianNudgeDismissAllowed(nudge.type) ? (
                          <GuardianNudgeDismissButton nudgeId={nudge.id} />
                        ) : null}
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Link href={nudgeHref(nudge)}>
                          <Button
                            size="sm"
                            variant={reviewCta ? "reward" : "neutral"}
                          >
                            {reviewCta ? "Review now" : "View task"}
                          </Button>
                        </Link>
                        {isNew ? (
                          <GuardianNudgeSeenButton nudgeId={nudge.id} />
                        ) : (
                          <span className="text-xs text-cub-muted">Seen</span>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
          </ul>
        </div>
      </Card>
    </section>
  );
}
