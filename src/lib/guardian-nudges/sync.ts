import { db } from "@/lib/db";
import {
  candidateStillValid,
  evaluateGuardianNudgeCandidates,
  prioritizeGuardianNudgeCandidates,
} from "@/lib/guardian-nudges/evaluate";
import { isWithinQuietHours } from "@/lib/guardian-nudges/quiet-hours";
import {
  shouldDismissNudgeForDisabledRule,
  shouldSkipDismissedCandidate,
} from "@/lib/guardian-nudges/rule-state";
import { DEFAULT_GUARDIAN_NUDGE_RULES } from "@/lib/guardian-nudges/types";
import type { TaskForNudgeEvaluation } from "@/lib/guardian-nudges/types";
import { guardianNudgePriority } from "@/lib/guardian-nudges/types";
import type { GuardianNudge } from "@/generated/prisma/client";
import { ACTIVE_CUB_STATUSES } from "@/lib/task-transitions";

export async function ensureDefaultGuardianNudgeRules(
  familyId: string,
  createdByUserId?: string,
) {
  const existing = await db.guardianNudgeRule.findMany({
    where: { familyId },
    select: { type: true },
  });
  const existingTypes = new Set(existing.map((rule) => rule.type));

  const missing = DEFAULT_GUARDIAN_NUDGE_RULES.filter(
    (rule) => !existingTypes.has(rule.type),
  );

  if (missing.length === 0) return;

  await db.guardianNudgeRule.createMany({
    data: missing.map((rule) => ({
      familyId,
      type: rule.type,
      enabled: rule.enabled,
      offsetMinutes: rule.offsetMinutes,
      createdByUserId: createdByUserId ?? null,
    })),
  });
}

export async function ensureGuardianNudgePreferences(familyId: string) {
  return db.guardianNudgePreferences.upsert({
    where: { familyId },
    create: { familyId },
    update: {},
  });
}

async function loadTasksForEvaluation(
  familyId: string,
): Promise<TaskForNudgeEvaluation[]> {
  return db.task.findMany({
    where: {
      familyId,
      cubId: { not: null },
      status: { in: [...ACTIVE_CUB_STATUSES, "SUBMITTED"] },
    },
    include: {
      cub: { select: { id: true, displayName: true } },
      focusBlocks: { select: { id: true } },
    },
  });
}

export async function syncGuardianNudgesForFamily(familyId: string) {
  await ensureDefaultGuardianNudgeRules(familyId);
  const prefs = await ensureGuardianNudgePreferences(familyId);

  const [rules, tasks, existingNudges] = await Promise.all([
    db.guardianNudgeRule.findMany({ where: { familyId } }),
    loadTasksForEvaluation(familyId),
    db.guardianNudge.findMany({
      where: {
        familyId,
        status: { in: ["ACTIVE", "SEEN"] },
      },
    }),
  ]);

  const candidates = prioritizeGuardianNudgeCandidates(
    evaluateGuardianNudgeCandidates({
      tasks,
      rules,
      prefs,
    }),
  );

  for (const candidate of candidates) {
    const existing = await db.guardianNudge.findUnique({
      where: {
        familyId_dedupeKey: {
          familyId,
          dedupeKey: candidate.dedupeKey,
        },
      },
    });

    if (
      shouldSkipDismissedCandidate(candidate.type, existing?.status)
    ) {
      continue;
    }

    const nextStatus =
      existing?.status === "SEEN" ? "SEEN" : "ACTIVE";

    await db.guardianNudge.upsert({
      where: {
        familyId_dedupeKey: {
          familyId,
          dedupeKey: candidate.dedupeKey,
        },
      },
      create: {
        familyId,
        type: candidate.type,
        taskId: candidate.taskId ?? null,
        cubId: candidate.cubId ?? null,
        message: candidate.message,
        dedupeKey: candidate.dedupeKey,
        status: "ACTIVE",
      },
      update: {
        message: candidate.message,
        taskId: candidate.taskId ?? null,
        cubId: candidate.cubId ?? null,
        status: nextStatus,
        dismissedAt: null,
      },
    });
  }

  for (const nudge of existingNudges) {
    if (shouldDismissNudgeForDisabledRule(nudge.type, rules, prefs)) {
      await db.guardianNudge.update({
        where: { id: nudge.id },
        data: { status: "DISMISSED", dismissedAt: new Date() },
      });
      continue;
    }

    const matchingCandidate = candidates.find(
      (c) => c.dedupeKey === nudge.dedupeKey,
    );

    if (matchingCandidate) {
      continue;
    }

    if (nudge.type === "DAILY_SUMMARY") {
      await db.guardianNudge.update({
        where: { id: nudge.id },
        data: { status: "DISMISSED", dismissedAt: new Date() },
      });
      continue;
    }

    if (!nudge.taskId) {
      continue;
    }

    const stillValid = candidateStillValid(
      {
        type: nudge.type,
        taskId: nudge.taskId,
        dedupeKey: nudge.dedupeKey,
        message: nudge.message,
        href: "/dashboard",
      },
      tasks,
    );

    if (!stillValid) {
      await db.guardianNudge.update({
        where: { id: nudge.id },
        data: { status: "DISMISSED", dismissedAt: new Date() },
      });
    }
  }
}

function sortNudgesForDisplay<
  T extends {
    type: GuardianNudge["type"];
    taskId: string | null;
    status: GuardianNudge["status"];
    triggeredAt: Date;
    task?: { isUrgent: boolean } | null;
  },
>(nudges: T[]): T[] {
  return [...nudges].sort((a, b) => {
    const aUrgent = a.task?.isUrgent ? 1 : 0;
    const bUrgent = b.task?.isUrgent ? 1 : 0;
    if (bUrgent !== aUrgent) {
      return bUrgent - aUrgent;
    }

    if (a.status !== b.status) {
      return a.status === "ACTIVE" ? -1 : 1;
    }

    return b.triggeredAt.getTime() - a.triggeredAt.getTime();
  });
}

function prioritizePersistedGuardianNudges<
  T extends {
    type: GuardianNudge["type"];
    taskId: string | null;
    status: GuardianNudge["status"];
    triggeredAt: Date;
    task?: { isUrgent: boolean } | null;
  },
>(nudges: T[]): T[] {
  const dailySummaries = nudges.filter((nudge) => nudge.type === "DAILY_SUMMARY");
  const bestByTask = new Map<string, T>();

  for (const nudge of nudges) {
    if (nudge.type === "DAILY_SUMMARY" || !nudge.taskId) {
      continue;
    }

    const current = bestByTask.get(nudge.taskId);
    if (
      !current ||
      guardianNudgePriority(nudge.type) < guardianNudgePriority(current.type)
    ) {
      bestByTask.set(nudge.taskId, nudge);
    }
  }

  return sortNudgesForDisplay([...bestByTask.values(), ...dailySummaries]);
}

export async function getActiveGuardianNudgesForFamily(familyId: string) {
  const nudges = await db.guardianNudge.findMany({
    where: {
      familyId,
      status: { in: ["ACTIVE", "SEEN"] },
    },
    orderBy: [{ status: "asc" }, { triggeredAt: "desc" }],
    include: {
      task: { select: { id: true, title: true, status: true, isUrgent: true } },
      cub: { select: { id: true, displayName: true } },
    },
  });

  return prioritizePersistedGuardianNudges(nudges);
}

export async function countUnseenGuardianNudges(familyId: string) {
  const prefs = await ensureGuardianNudgePreferences(familyId);
  if (isWithinQuietHours(prefs)) {
    return 0;
  }

  const nudges = await db.guardianNudge.findMany({
    where: { familyId, status: "ACTIVE" },
    select: {
      id: true,
      type: true,
      taskId: true,
      status: true,
      triggeredAt: true,
      task: { select: { isUrgent: true } },
    },
  });

  return prioritizePersistedGuardianNudges(nudges).length;
}

export async function resolveGuardianNudgesForTask(
  familyId: string,
  taskId: string,
  types?: Array<
    | "NOT_TOUCHED_AFTER_ASSIGN"
    | "NOT_STARTED_BEFORE_DUE"
    | "OVERDUE_NOT_STARTED"
    | "SUBMITTED_FOR_REVIEW"
  >,
) {
  await db.guardianNudge.updateMany({
    where: {
      familyId,
      taskId,
      status: { in: ["ACTIVE", "SEEN"] },
      ...(types ? { type: { in: types } } : {}),
    },
    data: {
      status: "DISMISSED",
      dismissedAt: new Date(),
    },
  });
}
