import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  detail?: string;
  highlight?: "amber" | "green" | "violet";
  className?: string;
};

export function StatCard({
  label,
  value,
  detail,
  highlight,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        highlight === "amber" && "border-amber-800/60 bg-amber-950/30",
        highlight === "green" && "border-emerald-800/60 bg-emerald-950/30",
        highlight === "violet" && "border-violet-800/60 bg-violet-950/30",
        !highlight && "border-zinc-800 bg-zinc-900",
        className,
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-zinc-100">{value}</p>
      {detail ? (
        <p className="mt-1 text-sm text-zinc-400">{detail}</p>
      ) : null}
    </div>
  );
}
