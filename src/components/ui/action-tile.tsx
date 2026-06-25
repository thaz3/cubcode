import Link from "next/link";
import { cn } from "@/lib/utils";

type ActionTileAccent = "gold" | "green" | "red" | "neutral" | "amber" | "violet" | "sky" | "emerald" | "zinc";

const ACCENT_STYLES: Record<
  "gold" | "green" | "red" | "neutral",
  { tile: string; icon: string; border: string }
> = {
  gold: {
    tile: "hover:border-cub-gold/50 hover:shadow-md hover:shadow-cub-gold/10",
    icon: "border-cub-gold/45 bg-cub-gold-muted text-cub-gold-light",
    border: "border-l-cub-gold",
  },
  green: {
    tile: "hover:border-cub-green-bright/50 hover:shadow-md hover:shadow-cub-green/10",
    icon: "border-cub-green-bright/45 bg-cub-green-muted text-cub-green-light",
    border: "border-l-cub-green-bright",
  },
  red: {
    tile: "hover:border-cub-red-alert/50 hover:shadow-md hover:shadow-cub-red/10",
    icon: "border-cub-red-alert/45 bg-cub-red-muted text-cub-red-light",
    border: "border-l-cub-red-alert",
  },
  neutral: {
    tile: "hover:border-cub-off-white/25 hover:shadow-md",
    icon: "border-cub-charcoal bg-cub-ebony text-cub-muted",
    border: "border-l-cub-charcoal",
  },
};

function resolveAccent(accent: ActionTileAccent): keyof typeof ACCENT_STYLES {
  if (accent === "amber" || accent === "violet" || accent === "sky") return "gold";
  if (accent === "emerald") return "green";
  if (accent === "zinc") return "neutral";
  return accent;
}

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
  accent = "neutral",
  className,
}: ActionTileProps) {
  const resolved = resolveAccent(accent);
  const styles = ACCENT_STYLES[resolved];

  return (
    <Link
      href={href}
      className={cn(
        "group flex min-h-[4.5rem] items-center gap-3 rounded-2xl border border-cub-charcoal/80 border-l-4 cub-card-surface px-4 py-3.5 shadow-sm transition active:scale-[0.99]",
        styles.border,
        styles.tile,
        className,
      )}
    >
      {icon ? (
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-lg shadow-sm",
            styles.icon,
          )}
          aria-hidden
        >
          {icon}
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="font-medium text-cub-off-white">{label}</p>
        {description ? (
          <p className="mt-0.5 truncate text-sm text-cub-muted">{description}</p>
        ) : null}
      </div>
      {badge != null ? (
        <span className="inline-flex min-h-7 min-w-7 shrink-0 items-center justify-center rounded-full bg-cub-gold px-2 text-xs font-semibold text-cub-ebony shadow-sm">
          {badge}
        </span>
      ) : (
        <span
          className="shrink-0 text-cub-gold-light transition group-hover:translate-x-0.5 group-hover:text-cub-gold-warm"
          aria-hidden
        >
          →
        </span>
      )}
    </Link>
  );
}
