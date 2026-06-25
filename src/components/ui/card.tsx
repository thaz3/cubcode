import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "accent" | "constructive" | "urgent" | "stat" | "interactive";
};

const variants = {
  default:
    "border-cub-charcoal/90 cub-card-surface shadow-md shadow-black/25",
  accent:
    "border-cub-gold/40 border-l-4 border-l-cub-gold cub-card-gold shadow-lg shadow-cub-gold/12",
  constructive:
    "border-cub-green-bright/40 border-l-4 border-l-cub-green-bright cub-card-green shadow-lg shadow-cub-green/12",
  urgent:
    "border-cub-red-alert/45 border-l-4 border-l-cub-red-alert cub-card-red shadow-lg shadow-cub-red/12",
  stat: "border-cub-charcoal/80 cub-card-surface shadow-md shadow-black/20",
  interactive:
    "border-cub-green/25 cub-card-surface shadow-sm transition hover:border-cub-green-bright/45 hover:shadow-md hover:shadow-cub-green/10 active:border-cub-gold/40",
};

export function Card({
  className,
  variant = "default",
  ...props
}: CardProps) {
  return (
    <div
      className={cn("rounded-2xl border p-5", variants[variant], className)}
      {...props}
    />
  );
}
