import type { LedgerReason } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { getWeekEnd } from "@/lib/council-day";

export type CubLedgerEntry = {
  id: string;
  ledgerType: "xp" | "focusToken" | "phone" | "weekendBank";
  amount: number;
  reason: LedgerReason;
  note: string | null;
  createdAt: Date;
};

type LedgerRow = {
  id: string;
  amount: number;
  reason: LedgerReason;
  note: string | null;
  createdAt: Date;
};

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
      }),
      db.focusTokenLedgerEntry.findMany({
        where: { cubId, ...(createdAtFilter ? { createdAt: createdAtFilter } : {}) },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      db.phoneTimeLedgerEntry.findMany({
        where: { cubId, ...(createdAtFilter ? { createdAt: createdAtFilter } : {}) },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      db.weekendBankLedgerEntry.findMany({
        where: { cubId, ...(createdAtFilter ? { createdAt: createdAtFilter } : {}) },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
    ]);

  return {
    xpEntries,
    focusTokenEntries,
    phoneEntries,
    weekendBankEntries,
  };
}
