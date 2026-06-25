import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  detail?: string;
  highlight?: "gold" | "green" | "red" | "amber" | "violet";
  className?: string;
};

const ACCENT_BAR: Record<"gold" | "green" | "red", string> = {
  gold: "bg-cub-gold",
  green: "bg-cub-green-bright",
  red: "bg-cub-red-alert",
};

const ACCENT_SURFACE: Record<"gold" | "green" | "red", string> = {
  gold: "border-cub-gold/40 cub-card-gold shadow-md shadow-cub-gold/10",
  green: "border-cub-green-bright/40 cub-card-green shadow-md shadow-cub-green/10",
  red: "border-cub-red-alert/40 cub-card-red shadow-md shadow-cub-red/10",
};

const ACCENT_LABEL: Record<"gold" | "green" | "red", string> = {
  gold: "text-cub-gold-light",
  green: "text-cub-green-light",
  red: "text-cub-red-light",
};

export function StatCard({
  label,
  value,
  detail,
  highlight,
  className,
}: StatCardProps) {
  const tone =
    highlight === "amber"
      ? "gold"
      : highlight === "violet"
        ? "gold"
        : highlight;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-4",
        tone ? ACCENT_SURFACE[tone] : "border-cub-charcoal/80 cub-card-surface shadow-sm",
        className,
      )}
    >
      {tone ? (
        <div
          className={cn("absolute inset-x-0 top-0 h-1", ACCENT_BAR[tone])}
          aria-hidden
        />
      ) : null}
      <p
        className={cn(
          "text-xs font-bold uppercase tracking-wide",
          tone ? ACCENT_LABEL[tone] : "text-cub-muted",
        )}
      >
        {label}
      </p>
      <p className="mt-1.5 text-2xl font-bold text-cub-off-white">{value}</p>
      {detail ? (
        <p className="mt-1 text-sm text-cub-muted">{detail}</p>
      ) : null}
    </div>
  );
}
