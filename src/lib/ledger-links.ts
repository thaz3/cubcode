import type { CubLedgerEntry } from "@/lib/cub-ledger";

export function getLedgerEntryHref(
  entry: Pick<CubLedgerEntry, "reason" | "sourceTaskId" | "councilDayCubEntryId">,
  cubId: string,
): string {
  if (entry.sourceTaskId) {
    return `/dashboard/tasks/${entry.sourceTaskId}`;
  }

  if (entry.reason === "COUNCIL_DAY" || entry.councilDayCubEntryId) {
    return "/dashboard/family-day";
  }

  if (entry.reason === "REWARD_REDEMPTION") {
    return "/dashboard/rewards";
  }

  return `/dashboard/cubs/${cubId}/progress`;
}
