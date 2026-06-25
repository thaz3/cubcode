import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildDedupeKey,
  buildSubmittedDedupeKey,
} from "@/lib/guardian-nudges/dedupe";
import {
  isGuardianNudgeDismissAllowed,
  isGuardianNudgeRuleTypeEnabled,
  shouldDismissNudgeForDisabledRule,
  shouldSkipDismissedCandidate,
} from "@/lib/guardian-nudges/rule-state";
import { isWithinQuietHours } from "@/lib/guardian-nudges/quiet-hours";
import {
  isTaskNotStarted,
  isTaskTouchedByCub,
} from "@/lib/guardian-nudges/touched";
import type { TaskForNudgeEvaluation } from "@/lib/guardian-nudges/types";
import type {
  GuardianNudgePreferences,
  GuardianNudgeRule,
} from "@/generated/prisma/client";

function baseTask(
  overrides: Partial<TaskForNudgeEvaluation> = {},
): TaskForNudgeEvaluation {
  return {
    id: "task-1",
    title: "Math Review",
    status: "CLAIMED",
    dueAt: null,
    dueAtHasTime: false,
    claimedAt: new Date("2025-06-01T12:00:00.000Z"),
    createdAt: new Date("2025-06-01T12:00:00.000Z"),
    startedAt: null,
    focusSessionStartedAt: null,
    reflection: null,
    proofLink: null,
    checklistData: null,
    submittedAt: null,
    cubId: "cub-1",
    isUrgent: false,
    cub: { id: "cub-1", displayName: "Jordan" },
    focusBlocks: [],
    ...overrides,
  };
}

function baseRule(
  type: GuardianNudgeRule["type"],
  enabled = true,
): GuardianNudgeRule {
  return {
    id: `rule-${type}`,
    type,
    enabled,
    offsetMinutes: type === "NOT_STARTED_BEFORE_DUE" ? 120 : null,
    createdAt: new Date(),
    updatedAt: new Date(),
    familyId: "family-1",
    createdByUserId: "user-1",
  };
}

function basePrefs(
  overrides: Partial<GuardianNudgePreferences> = {},
): GuardianNudgePreferences {
  return {
    id: "prefs-1",
    quietHoursStart: "22:00",
    quietHoursEnd: "07:00",
    timezone: "America/New_York",
    dailySummaryEnabled: false,
    dailySummaryTime: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    familyId: "family-1",
    ...overrides,
  };
}

describe("isTaskTouchedByCub", () => {
  it("treats CLAIMED alone as not touched", () => {
    const task = baseTask({ status: "CLAIMED" });
    assert.equal(isTaskTouchedByCub(task), false);
    assert.equal(isTaskNotStarted(task), true);
  });

  it("treats IN_PROGRESS as touched", () => {
    const task = baseTask({ status: "IN_PROGRESS", startedAt: new Date() });
    assert.equal(isTaskTouchedByCub(task), true);
    assert.equal(isTaskNotStarted(task), false);
  });

  it("treats focus block logs as touched while still CLAIMED", () => {
    const task = baseTask({
      status: "CLAIMED",
      focusBlocks: [{ id: "focus-1" }],
    });
    assert.equal(isTaskTouchedByCub(task), true);
    assert.equal(isTaskNotStarted(task), false);
  });

  it("treats checklist progress as touched", () => {
    const task = baseTask({
      status: "CLAIMED",
      checklistData: { item1: true },
    });
    assert.equal(isTaskTouchedByCub(task), true);
  });
});

describe("dedupe keys", () => {
  it("builds stable submitted-for-review keys per task", () => {
    assert.equal(buildSubmittedDedupeKey("task-1"), "submitted:task-1");
    assert.equal(
      buildDedupeKey("SUBMITTED_FOR_REVIEW", { taskId: "task-1" }),
      "submitted:task-1",
    );
  });
});

describe("rule disable cleanup", () => {
  const rules = [
    baseRule("NOT_TOUCHED_AFTER_ASSIGN", false),
    baseRule("NOT_STARTED_BEFORE_DUE", true),
    baseRule("OVERDUE_NOT_STARTED", true),
    baseRule("SUBMITTED_FOR_REVIEW", true),
    baseRule("DAILY_SUMMARY", true),
  ];

  it("flags disabled rule types for dismissal", () => {
    assert.equal(
      shouldDismissNudgeForDisabledRule(
        "NOT_TOUCHED_AFTER_ASSIGN",
        rules,
        basePrefs(),
      ),
      true,
    );
    assert.equal(
      shouldDismissNudgeForDisabledRule(
        "NOT_STARTED_BEFORE_DUE",
        rules,
        basePrefs(),
      ),
      false,
    );
  });

  it("requires daily summary preference and rule", () => {
    assert.equal(
      isGuardianNudgeRuleTypeEnabled("DAILY_SUMMARY", rules, basePrefs()),
      false,
    );
    assert.equal(
      isGuardianNudgeRuleTypeEnabled(
        "DAILY_SUMMARY",
        rules,
        basePrefs({ dailySummaryEnabled: true }),
      ),
      true,
    );
  });
});

describe("quiet hours", () => {
  it("detects overnight quiet hours", () => {
    const prefs = basePrefs({
      quietHoursStart: "22:00",
      quietHoursEnd: "07:00",
      timezone: "America/New_York",
    });

    const during = new Date("2025-01-15T03:00:00.000Z");
    const outside = new Date("2025-01-15T17:00:00.000Z");

    assert.equal(isWithinQuietHours(prefs, during), true);
    assert.equal(isWithinQuietHours(prefs, outside), false);
  });
});

describe("submitted-for-review dismiss behavior", () => {
  it("does not allow dismiss for review nudges", () => {
    assert.equal(isGuardianNudgeDismissAllowed("SUBMITTED_FOR_REVIEW"), false);
    assert.equal(isGuardianNudgeDismissAllowed("OVERDUE_NOT_STARTED"), true);
  });

  it("restores dismissed review candidates on sync", () => {
    assert.equal(
      shouldSkipDismissedCandidate("SUBMITTED_FOR_REVIEW", "DISMISSED"),
      false,
    );
    assert.equal(
      shouldSkipDismissedCandidate("OVERDUE_NOT_STARTED", "DISMISSED"),
      true,
    );
  });
});
