/**
 * C.U.B. Code brand + status color class bundles.
 * Visual tokens only — keep labels on all status UI for accessibility.
 */

export const cubStatusBadge = {
  available:
    "bg-cub-gold-muted text-cub-gold-light ring-1 ring-cub-gold/45 shadow-sm shadow-cub-gold/10",
  claimed:
    "bg-cub-charcoal text-cub-off-white ring-1 ring-cub-gold/50 border border-cub-gold/35",
  inProgress:
    "bg-cub-green-muted text-cub-green-light ring-1 ring-cub-green-bright/40 shadow-sm shadow-cub-green/10",
  submitted:
    "bg-cub-gold-muted text-cub-gold-light ring-1 ring-cub-gold/50 shadow-sm shadow-cub-gold/15",
  sentBack:
    "bg-cub-gold-muted text-cub-gold-warm ring-1 ring-cub-gold/55",
  rejected:
    "bg-cub-red-muted text-cub-off-white ring-1 ring-cub-red-alert/50 shadow-sm shadow-cub-red/10",
  approved:
    "bg-cub-green-muted text-cub-green-light ring-1 ring-cub-green-bright/45",
  completed:
    "bg-cub-green-muted text-cub-green-light ring-1 ring-cub-gold/50 ring-inset",
  pending: "bg-cub-charcoal text-cub-muted ring-1 ring-cub-off-white/12",
  rewarded:
    "bg-cub-green-muted text-cub-green-light ring-1 ring-cub-gold/55 shadow-sm shadow-cub-gold/10",
} as const;

export const cubLink = "text-cub-gold-light hover:text-cub-gold-warm";

export const cubSuccessText = "text-cub-green-light";

export const cubErrorText = "text-cub-red-light";

export const cubSectionLabel =
  "text-[11px] font-bold uppercase tracking-[0.14em] text-cub-gold-light";

export const cubSectionTitle = "text-lg font-bold tracking-tight text-cub-off-white";

export const cubNudgeCard =
  "border border-cub-red/25 border-l-4 border-l-cub-red-alert cub-card-red shadow-md shadow-cub-red/10";

export const cubNudgeHeader =
  "border-b border-cub-red/20 border-l-4 border-l-cub-red-alert bg-cub-red-muted/40";

export const cubFocusBanner =
  "border border-cub-green-bright/45 bg-cub-green-muted shadow-sm shadow-cub-green/10";

export const cubNavActive =
  "bg-cub-gold-muted text-cub-gold-light ring-1 ring-cub-gold/40 shadow-sm shadow-cub-gold/10";

export const cubNavInactive =
  "text-cub-muted hover:bg-cub-charcoal/80 hover:text-cub-off-white";

/** Visual-only helpers for Next Up cards (no product logic). */
export function nextActionCardClass(priority: "urgent" | "normal" | "setup"): string {
  if (priority === "urgent") {
    return "border-cub-gold/40 border-l-4 border-l-cub-gold cub-card-gold shadow-lg shadow-cub-gold/10";
  }
  if (priority === "setup") {
    return "border-cub-green-bright/40 border-l-4 border-l-cub-green-bright cub-card-green shadow-lg shadow-cub-green/10";
  }
  return "border-cub-green-bright/35 border-l-4 border-l-cub-green-bright cub-card-green shadow-md shadow-cub-green/8";
}

export type CubButtonVariant =
  | "constructive"
  | "reward"
  | "warning"
  | "danger"
  | "dangerOutline"
  | "neutral"
  | "ghost";

export function nextActionButtonVariant(
  priority: "urgent" | "normal" | "setup",
  buttonLabel: string,
): CubButtonVariant {
  const label = buttonLabel.toLowerCase();
  if (priority === "urgent" || label.includes("review")) return "reward";
  if (priority === "setup" || label.includes("add")) return "constructive";
  if (label.includes("continue")) return "constructive";
  if (label.includes("view") || label.includes("go to")) return "reward";
  return "constructive";
}
