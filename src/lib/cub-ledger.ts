import type { LedgerReason } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { getWeekEnd } from "@/lib/council-day";
import { LEDGER_REASON_LABELS } from "@/lib/ledger-labels";

export type CubLedgerEntry = {
  id: string;
  ledgerType: "xp" | "focusToken" | "phone" | "weekendBank";
  amount: number;
  reason: LedgerReason;
  note: string | null;
  createdAt: Date;
  sourceTaskId: string | null;
  councilDayCubEntryId: string | null;
};

export type CubLedgerDropdownEntry = Omit<CubLedgerEntry, "createdAt"> & {
  createdAt: string;
};

export function serializeLedgerEntries(
  entries: CubLedgerEntry[],
): CubLedgerDropdownEntry[] {
  return entries.map((entry) => ({
    ...entry,
    createdAt: entry.createdAt.toISOString(),
  }));
}

type LedgerRow = {
  id: string;
  amount: number;
  reason: LedgerReason;
  note: string | null;
  createdAt: Date;
  sourceTaskId: string | null;
  councilDayCubEntryId: string | null;
};

const ledgerEntrySelect = {
  id: true,
  amount: true,
  reason: true,
  note: true,
  createdAt: true,
  sourceTaskId: true,
  councilDayCubEntryId: true,
} as const;

function mergeLedgerSections(
  sections: Array<{
    ledgerType: CubLedgerEntry["ledgerType"];
    unit: string;
    entries: LedgerRow[];
  }>,
): CubLedgerEntry[] {
  return sections
    .flatMap((section) =>
      section.entries.map((entry) => ({
        id: `${section.ledgerType}-${entry.id}`,
        ledgerType: section.ledgerType,
        amount: entry.amount,
        reason: entry.reason,
        note: entry.note,
        createdAt: entry.createdAt,
        sourceTaskId: entry.sourceTaskId,
        councilDayCubEntryId: entry.councilDayCubEntryId,
      })),
    )
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getCubLedgerEntries(
  cubId: string,
  options?: {
    limit?: number;
    weekStartsOn?: Date;
  },
): Promise<CubLedgerEntry[]> {
  const grouped = await getCubLedgerEntriesGrouped(cubId, options);
  return mergeLedgerSections([
    { ledgerType: "xp", unit: "XP", entries: grouped.xpEntries },
    {
      ledgerType: "focusToken",
      unit: "tokens",
      entries: grouped.focusTokenEntries,
    },
    { ledgerType: "phone", unit: "min", entries: grouped.phoneEntries },
    {
      ledgerType: "weekendBank",
      unit: "min",
      entries: grouped.weekendBankEntries,
    },
  ]).slice(0, options?.limit ?? 8);
}

export async function getCubLedgerEntriesGrouped(
  cubId: string,
  options?: {
    limit?: number;
    weekStartsOn?: Date;
  },
) {
  const limit = options?.limit ?? 8;
  const weekEnd = options?.weekStartsOn ? getWeekEnd(options.weekStartsOn) : null;
  const createdAtFilter = options?.weekStartsOn
    ? { gte: options.weekStartsOn, lt: weekEnd! }
    : undefined;

  const [xpEntries, focusTokenEntries, phoneEntries, weekendBankEntries] =
    await Promise.all([
      db.xpLedgerEntry.findMany({
        where: { cubId, ...(createdAtFilter ? { createdAt: createdAtFilter } : {}) },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: ledgerEntrySelect,
      }),
      db.focusTokenLedgerEntry.findMany({
        where: { cubId, ...(createdAtFilter ? { createdAt: createdAtFilter } : {}) },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: ledgerEntrySelect,
      }),
      db.phoneTimeLedgerEntry.findMany({
        where: { cubId, ...(createdAtFilter ? { createdAt: createdAtFilter } : {}) },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          amount: true,
          reason: true,
          note: true,
          createdAt: true,
          sourceTaskId: true,
        },
      }),
      db.weekendBankLedgerEntry.findMany({
        where: { cubId, ...(createdAtFilter ? { createdAt: createdAtFilter } : {}) },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          amount: true,
          reason: true,
          note: true,
          createdAt: true,
          sourceTaskId: true,
        },
      }),
    ]);

  const normalizePhoneEntry = (
    entry: Omit<LedgerRow, "councilDayCubEntryId">,
  ): LedgerRow => ({
    ...entry,
    councilDayCubEntryId: null,
  });

  return {
    xpEntries,
    focusTokenEntries,
    phoneEntries: phoneEntries.map(normalizePhoneEntry),
    weekendBankEntries: weekendBankEntries.map(normalizePhoneEntry),
  };
}

export type GroupedEarnedRewards = {
  xp: number;
  focusTokens: number;
  phoneMinutes: number;
  weekendBankMinutes: number;
};

export type GroupedEarnedEntry = {
  id: string;
  createdAt: Date;
  reason: LedgerReason;
  label: string;
  title: string;
  rewards: GroupedEarnedRewards;
};

function ledgerGroupKey(entry: CubLedgerEntry): string {
  if (entry.sourceTaskId) {
    return `task:${entry.sourceTaskId}`;
  }
  if (entry.councilDayCubEntryId) {
    return `council:${entry.councilDayCubEntryId}`;
  }
  if (
    entry.reason === "REWARD_REDEMPTION" ||
    entry.note?.startsWith("Redeemed:")
  ) {
    const baseNote = entry.note?.split(" — ")[0]?.trim() ?? entry.id;
    return `redeem:${baseNote}`;
  }
  return `solo:${entry.id}`;
}

function titleFromLedgerNote(note: string | null, reason: LedgerReason): string {
  if (!note) {
    return LEDGER_REASON_LABELS[reason];
  }
  const approved = /^Approved: (.+)$/.exec(note);
  if (approved) {
    return approved[1]!.replace(/ · .+$/, "").replace(/ \(50%.*$/, "");
  }
  const redeemed = /^Redeemed: (.+)$/.exec(note.split(" — ")[0] ?? note);
  if (redeemed) {
    return redeemed[1]!;
  }
  return note.split(" — ")[0] ?? note;
}

function groupLabelForEntry(entry: CubLedgerEntry): string {
  if (entry.sourceTaskId && entry.reason === "TASK_APPROVAL") {
    return "Task approved";
  }
  if (entry.councilDayCubEntryId) {
    return LEDGER_REASON_LABELS.COUNCIL_DAY;
  }
  if (entry.note?.startsWith("Redeemed:")) {
    return "Reward redeemed";
  }
  return LEDGER_REASON_LABELS[entry.reason];
}

function addToGroupedRewards(
  rewards: GroupedEarnedRewards,
  entry: CubLedgerEntry,
): void {
  switch (entry.ledgerType) {
    case "xp":
      rewards.xp += entry.amount;
      break;
    case "focusToken":
      rewards.focusTokens += entry.amount;
      break;
    case "phone":
      rewards.phoneMinutes += entry.amount;
      break;
    case "weekendBank":
      rewards.weekendBankMinutes += entry.amount;
      break;
  }
}

/** Merge ledger lines that belong to the same task approval, redemption, or Family Day bonus. */
export function groupCubLedgerEntries(
  entries: CubLedgerEntry[],
): GroupedEarnedEntry[] {
  const groups = new Map<string, GroupedEarnedEntry>();

  for (const entry of entries) {
    const key = ledgerGroupKey(entry);
    let group = groups.get(key);

    if (!group) {
      group = {
        id: key,
        createdAt: entry.createdAt,
        reason: entry.reason,
        label: groupLabelForEntry(entry),
        title: titleFromLedgerNote(entry.note, entry.reason),
        rewards: {
          xp: 0,
          focusTokens: 0,
          phoneMinutes: 0,
          weekendBankMinutes: 0,
        },
      };
      groups.set(key, group);
    }

    if (entry.createdAt > group.createdAt) {
      group.createdAt = entry.createdAt;
    }

    addToGroupedRewards(group.rewards, entry);
  }

  return [...groups.values()].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
}

export function formatGroupedEarnedRewards(rewards: GroupedEarnedRewards): string {
  const parts: string[] = [];

  if (rewards.xp !== 0) {
    parts.push(`${rewards.xp > 0 ? "+" : ""}${rewards.xp} XP`);
  }
  if (rewards.focusTokens !== 0) {
    const abs = Math.abs(rewards.focusTokens);
    parts.push(
      `${rewards.focusTokens > 0 ? "+" : "−"}${abs} Focus Token${abs === 1 ? "" : "s"}`,
    );
  }
  if (rewards.phoneMinutes !== 0) {
    parts.push(
      `${rewards.phoneMinutes > 0 ? "+" : ""}${rewards.phoneMinutes} min phone`,
    );
  }
  if (rewards.weekendBankMinutes !== 0) {
    parts.push(
      `${rewards.weekendBankMinutes > 0 ? "+" : ""}${rewards.weekendBankMinutes} min bank`,
    );
  }

  return parts.join(" · ");
}
