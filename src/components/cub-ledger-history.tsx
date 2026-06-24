import {
  LEDGER_REASON_LABELS,
  formatLedgerAmount,
} from "@/lib/ledger-labels";
import type { CubLedgerEntry } from "@/lib/cub-ledger";

const PHONE_REASON_LABELS: Partial<Record<keyof typeof LEDGER_REASON_LABELS, string>> = {
  TASK_APPROVAL: "Earned from approved task",
  REWARD_REDEMPTION: "Redeemed from Reward Store",
  DAILY_CAP_OVERFLOW: "Moved to Weekend Bank (daily cap)",
};

const LEDGER_UNITS: Record<CubLedgerEntry["ledgerType"], string> = {
  xp: "XP",
  focusToken: "tokens",
  phone: "min",
  weekendBank: "min",
};

type LedgerRow = {
  id: string;
  amount: number;
  reason: keyof typeof LEDGER_REASON_LABELS;
  note: string | null;
  createdAt: Date;
};

type CubLedgerHistoryProps = {
  xpEntries: LedgerRow[];
  focusTokenEntries: LedgerRow[];
  phoneEntries: LedgerRow[];
  weekendBankEntries: LedgerRow[];
};

export function CubLedgerHistory({
  xpEntries,
  focusTokenEntries,
  phoneEntries,
  weekendBankEntries,
}: CubLedgerHistoryProps) {
  const sections = [
    { title: "XP", unit: "XP", entries: xpEntries },
    { title: "Focus Tokens", unit: "tokens", entries: focusTokenEntries },
    { title: "Phone time", unit: "min", entries: phoneEntries },
    { title: "Weekend Bank", unit: "min", entries: weekendBankEntries },
  ].filter((section) => section.entries.length > 0);

  if (sections.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No ledger entries yet. Approve a completed task to credit rewards.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.title}>
          <h3 className="text-sm font-semibold">{section.title}</h3>
          <CubLedgerEntryList
            entries={section.entries.map((entry) => ({
              id: entry.id,
              ledgerType:
                section.unit === "XP"
                  ? "xp"
                  : section.unit === "tokens"
                    ? "focusToken"
                    : section.title === "Weekend Bank"
                      ? "weekendBank"
                      : "phone",
              amount: entry.amount,
              reason: entry.reason,
              note: entry.note,
              createdAt: entry.createdAt,
            }))}
          />
        </div>
      ))}
    </div>
  );
}

type CubLedgerTimelineProps = {
  entries: CubLedgerEntry[];
  limit?: number;
  emptyMessage?: string;
  className?: string;
};

export function CubLedgerTimeline({
  entries,
  limit = 5,
  emptyMessage = "No ledger activity yet.",
  className,
}: CubLedgerTimelineProps) {
  if (entries.length === 0) {
    return <p className={`text-sm text-zinc-500 ${className ?? ""}`}>{emptyMessage}</p>;
  }

  return (
    <div className={className}>
      <CubLedgerEntryList entries={entries.slice(0, limit)} compact />
    </div>
  );
}

function CubLedgerEntryList({
  entries,
  compact = false,
}: {
  entries: CubLedgerEntry[];
  compact?: boolean;
}) {
  return (
    <ul className={compact ? "mt-1 space-y-1.5" : "mt-2 space-y-2"}>
      {entries.map((entry) => {
        const unit = LEDGER_UNITS[entry.ledgerType];
        const reasonLabel =
          entry.ledgerType === "phone" && entry.reason in PHONE_REASON_LABELS
            ? PHONE_REASON_LABELS[entry.reason as keyof typeof PHONE_REASON_LABELS]
            : LEDGER_REASON_LABELS[entry.reason];

        return (
          <li
            key={entry.id}
            className={
              compact
                ? "text-xs text-zinc-600 dark:text-zinc-400"
                : "rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
            }
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className={compact ? "font-medium text-zinc-800 dark:text-zinc-200" : "font-medium"}>
                {formatLedgerAmount(entry.amount, unit)}
              </span>
              <span className="text-xs text-zinc-500">
                {entry.createdAt.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <p className={compact ? "text-zinc-500" : "mt-1 text-zinc-600 dark:text-zinc-400"}>
              {reasonLabel}
            </p>
            {entry.note ? (
              <p className="mt-0.5 text-zinc-500">{entry.note}</p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
