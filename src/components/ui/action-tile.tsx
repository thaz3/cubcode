import Link from "next/link";
import { cn } from "@/lib/utils";

type ActionTileAccent = "amber" | "violet" | "sky" | "emerald" | "zinc";

const ACCENT_STYLES: Record<
  ActionTileAccent,
  { tile: string; icon: string }
> = {
  amber: {
    tile: "hover:border-amber-800/80 hover:bg-amber-950/20",
    icon: "border-amber-800/60 bg-amber-950/50 text-amber-400",
  },
  violet: {
    tile: "hover:border-violet-800/80 hover:bg-violet-950/20",
    icon: "border-violet-800/60 bg-violet-950/50 text-violet-400",
  },
  sky: {
    tile: "hover:border-sky-800/80 hover:bg-sky-950/20",
    icon: "border-sky-800/60 bg-sky-950/50 text-sky-400",
  },
  emerald: {
    tile: "hover:border-emerald-800/80 hover:bg-emerald-950/20",
    icon: "border-emerald-800/60 bg-emerald-950/50 text-emerald-400",
  },
  zinc: {
    tile: "hover:border-zinc-700 hover:bg-zinc-800/40",
    icon: "border-zinc-700 bg-zinc-800/80 text-zinc-300",
  },
};

type ActionTileProps = {
  href: string;
  label: string;
  description?: string;
  badge?: string | number;
  icon?: React.ReactNode;
  accent?: ActionTileAccent;
  className?: string;
};

export function ActionTile({
  href,
  label,
  description,
  badge,
  icon,
  accent = "zinc",
  className,
}: ActionTileProps) {
  const styles = ACCENT_STYLES[accent];

  return (
    <Link
      href={href}
      className={cn(
        "group flex min-h-[4.5rem] items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/80 px-4 py-3.5 transition active:scale-[0.99]",
        styles.tile,
        className,
      )}
    >
      {icon ? (
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-lg",
            styles.icon,
          )}
          aria-hidden
        >
          {icon}
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="font-medium text-zinc-100">{label}</p>
        {description ? (
          <p className="mt-0.5 truncate text-sm text-zinc-500">{description}</p>
        ) : null}
      </div>
      {badge != null ? (
        <span className="inline-flex min-h-7 min-w-7 shrink-0 items-center justify-center rounded-full bg-amber-600 px-2 text-xs font-semibold text-white">
          {badge}
        </span>
      ) : (
        <span
          className="shrink-0 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-zinc-400"
          aria-hidden
        >
          →
        </span>
      )}
    </Link>
  );
}
