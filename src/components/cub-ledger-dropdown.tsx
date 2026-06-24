"use client";

import Link from "next/link";
import {
  LEDGER_REASON_LABELS,
  TASK_HISTORY_LABEL,
  formatLedgerAmount,
} from "@/lib/ledger-labels";
import { getLedgerEntryHref } from "@/lib/ledger-links";
import type { CubLedgerEntry, CubLedgerDropdownEntry } from "@/lib/cub-ledger";
import { cn } from "@/lib/utils";

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

const LEDGER_TYPE_LABELS: Record<CubLedgerEntry["ledgerType"], string> = {
  xp: "XP",
  focusToken: "Token",
  phone: "Phone",
  weekendBank: "Bank",
};

type CubLedgerDropdownProps = {
  cubId: string;
  entries: CubLedgerDropdownEntry[];
  label?: string;
  emptyMessage?: string;
  defaultOpen?: boolean;
  className?: string;
  maxListHeightClass?: string;
};

export function CubLedgerDropdown({
  cubId,
  entries,
  label = TASK_HISTORY_LABEL,
  emptyMessage = "No task history yet.",
  defaultOpen = false,
  className,
  maxListHeightClass = "max-h-48",
}: CubLedgerDropdownProps) {
  if (entries.length === 0) {
    return <p className={cn("text-sm text-zinc-500", className)}>{emptyMessage}</p>;
  }

  return (
    <details
      className={cn("group rounded-lg border border-zinc-200 dark:border-zinc-800", className)}
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-sm font-medium text-zinc-800 marker:content-none dark:text-zinc-200 [&::-webkit-details-marker]:hidden">
        <span>
          {label}{" "}
          <span className="font-normal text-zinc-500">({entries.length})</span>
        </span>
        <span
          aria-hidden
          className="text-xs text-zinc-400 transition group-open:rotate-180"
        >
          ▼
        </span>
      </summary>

      <ul
        className={cn(
          "space-y-1 overflow-y-auto border-t border-zinc-200 p-2 dark:border-zinc-800",
          maxListHeightClass,
        )}
      >
        {entries.map((entry) => (
          <CubLedgerDropdownItem
            key={entry.id}
            entry={entry}
            cubId={cubId}
          />
        ))}
      </ul>
    </details>
  );
}

function CubLedgerDropdownItem({
  entry,
  cubId,
}: {
  entry: CubLedgerDropdownEntry;
  cubId: string;
}) {
  const unit = LEDGER_UNITS[entry.ledgerType];
  const reasonLabel =
    entry.ledgerType === "phone" && entry.reason in PHONE_REASON_LABELS
      ? PHONE_REASON_LABELS[entry.reason as keyof typeof PHONE_REASON_LABELS]
      : LEDGER_REASON_LABELS[entry.reason];
  const createdAt = new Date(entry.createdAt);
  const href = getLedgerEntryHref(entry, cubId);

  return (
    <li>
      <Link
        href={href}
        className="block rounded-md border border-transparent px-2 py-2 transition hover:border-zinc-200 hover:bg-zinc-50 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/60"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {LEDGER_TYPE_LABELS[entry.ledgerType]}
            </span>
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {formatLedgerAmount(entry.amount, unit)}
            </span>
          </div>
          <span className="text-xs text-zinc-500">
            {createdAt.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{reasonLabel}</p>
        {entry.note ? (
          <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500">{entry.note}</p>
        ) : null}
      </Link>
    </li>
  );
}
