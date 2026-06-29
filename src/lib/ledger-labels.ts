import type { LedgerReason } from "@/generated/prisma/client";
import { FAMILY_DAY_LABEL } from "@/lib/family-day-labels";

export const TASK_HISTORY_LABEL = "Task history";

export const LEDGER_REASON_LABELS: Record<LedgerReason, string> = {
  TASK_APPROVAL: "Task approved",
  CHALLENGE_APPROVAL: "Routine approved",
  FOCUS_DECK_APPROVAL: "Focus card approved",
  REWARD_REDEMPTION: "Reward redeemed",
  PARENT_ADJUSTMENT: "Offline behavior bonus",
  DAILY_CAP_OVERFLOW: "Weekend Bank (daily cap)",
  WEEKEND_BANK_USE: "Weekend Bank used",
  COUNCIL_DAY: `${FAMILY_DAY_LABEL} bonus`,
};

export const FOCUS_TOKEN_REASON_LABELS: Partial<Record<LedgerReason, string>> = {
  PARENT_ADJUSTMENT: "Offline token deal",
};

export function formatLedgerAmount(amount: number, unit: string): string {
  const prefix = amount > 0 ? "+" : "";
  return `${prefix}${amount} ${unit}`;
}

export function formatMinutes(minutes: number): string {
  if (minutes === 1) {
    return "1 min";
  }
  return `${minutes} min`;
}
