import type { LedgerReason } from "@/generated/prisma/client";
import { FAMILY_DAY_LABEL } from "@/lib/family-day-labels";

export const LEDGER_REASON_LABELS: Record<LedgerReason, string> = {
  TASK_APPROVAL: "Task approved",
  REWARD_REDEMPTION: "Reward redeemed",
  PARENT_ADJUSTMENT: "Parent adjustment",
  DAILY_CAP_OVERFLOW: "Weekend Bank (daily cap)",
  WEEKEND_BANK_USE: "Weekend Bank used",
  COUNCIL_DAY: `${FAMILY_DAY_LABEL} bonus`,
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
