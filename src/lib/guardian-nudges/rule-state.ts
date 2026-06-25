import type {
  GuardianNudgePreferences,
  GuardianNudgeRule,
  GuardianNudgeRuleType,
  GuardianNudgeStatus,
} from "@/generated/prisma/client";

/** Review nudges stay until the task is reviewed — parents may only mark them seen. */
export function isGuardianNudgeDismissAllowed(
  type: GuardianNudgeRuleType,
): boolean {
  return type !== "SUBMITTED_FOR_REVIEW";
}

export function isGuardianNudgeRuleTypeEnabled(
  type: GuardianNudgeRuleType,
  rules: GuardianNudgeRule[],
  prefs: GuardianNudgePreferences | null,
): boolean {
  const rule = rules.find((item) => item.type === type);
  if (!rule?.enabled) {
    return false;
  }

  if (type === "DAILY_SUMMARY") {
    return Boolean(prefs?.dailySummaryEnabled);
  }

  return true;
}

export function shouldDismissNudgeForDisabledRule(
  nudgeType: GuardianNudgeRuleType,
  rules: GuardianNudgeRule[],
  prefs: GuardianNudgePreferences | null,
): boolean {
  return !isGuardianNudgeRuleTypeEnabled(nudgeType, rules, prefs);
}

/** Dismissed rows are permanent for most types; review nudges may be restored while still submitted. */
export function shouldSkipDismissedCandidate(
  candidateType: GuardianNudgeRuleType,
  existingStatus: GuardianNudgeStatus | undefined,
): boolean {
  if (existingStatus !== "DISMISSED") {
    return false;
  }

  return candidateType !== "SUBMITTED_FOR_REVIEW";
}
