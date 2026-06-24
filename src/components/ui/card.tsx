import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "accent" | "stat" | "interactive";
};

const variants = {
  default: "border-zinc-800 bg-zinc-900",
  accent: "border-amber-800/60 bg-amber-950/30",
  stat: "border-zinc-800 bg-zinc-900/80",
  interactive:
    "border-zinc-800 bg-zinc-900 transition hover:border-zinc-700 active:border-zinc-600",
};

export function Card({
  className,
  variant = "default",
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5 shadow-sm",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
