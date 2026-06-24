import {
  serializeLedgerEntries,
  type CubLedgerDropdownEntry,
  type CubLedgerEntry,
} from "@/lib/cub-ledger";
import { CubLedgerDropdown } from "@/components/cub-ledger-dropdown";
import { TASK_HISTORY_LABEL } from "@/lib/ledger-labels";

type LedgerRow = {
  id: string;
  amount: number;
  reason: CubLedgerEntry["reason"];
  note: string | null;
  createdAt: Date;
  sourceTaskId?: string | null;
  councilDayCubEntryId?: string | null;
};

type CubLedgerHistoryProps = {
  cubId: string;
  xpEntries: LedgerRow[];
  focusTokenEntries: LedgerRow[];
  phoneEntries: LedgerRow[];
  weekendBankEntries: LedgerRow[];
  defaultOpen?: boolean;
};

function toCubLedgerEntry(
  entry: LedgerRow,
  ledgerType: CubLedgerEntry["ledgerType"],
): CubLedgerEntry {
  return {
    id: `${ledgerType}-${entry.id}`,
    ledgerType,
    amount: entry.amount,
    reason: entry.reason,
    note: entry.note,
    createdAt: entry.createdAt,
    sourceTaskId: entry.sourceTaskId ?? null,
    councilDayCubEntryId: entry.councilDayCubEntryId ?? null,
  };
}

function mergeGroupedEntries(props: CubLedgerHistoryProps): CubLedgerDropdownEntry[] {
  const merged: CubLedgerEntry[] = [
    ...props.xpEntries.map((entry) => toCubLedgerEntry(entry, "xp")),
    ...props.focusTokenEntries.map((entry) =>
      toCubLedgerEntry(entry, "focusToken"),
    ),
    ...props.phoneEntries.map((entry) => toCubLedgerEntry(entry, "phone")),
    ...props.weekendBankEntries.map((entry) =>
      toCubLedgerEntry(entry, "weekendBank"),
    ),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return serializeLedgerEntries(merged);
}

export function CubLedgerHistory({
  cubId,
  xpEntries,
  focusTokenEntries,
  phoneEntries,
  weekendBankEntries,
  defaultOpen = true,
}: CubLedgerHistoryProps) {
  const entries = mergeGroupedEntries({
    cubId,
    xpEntries,
    focusTokenEntries,
    phoneEntries,
    weekendBankEntries,
  });

  return (
    <CubLedgerDropdown
      cubId={cubId}
      entries={entries}
      label={TASK_HISTORY_LABEL}
      defaultOpen={defaultOpen}
      maxListHeightClass="max-h-72"
      emptyMessage="No task history yet. Approve a completed task to credit rewards."
    />
  );
}

type CubLedgerTimelineProps = {
  cubId: string;
  entries: CubLedgerEntry[];
  limit?: number;
  label?: string;
  emptyMessage?: string;
  className?: string;
  defaultOpen?: boolean;
};

export function CubLedgerTimeline({
  cubId,
  entries,
  limit,
  label = TASK_HISTORY_LABEL,
  emptyMessage = "No task history yet.",
  className,
  defaultOpen = false,
}: CubLedgerTimelineProps) {
  const sliced = limit ? entries.slice(0, limit) : entries;

  return (
    <CubLedgerDropdown
      cubId={cubId}
      entries={serializeLedgerEntries(sliced)}
      label={label}
      emptyMessage={emptyMessage}
      className={className}
      defaultOpen={defaultOpen}
    />
  );
}
