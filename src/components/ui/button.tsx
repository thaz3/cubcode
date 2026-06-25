import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?:
    | "constructive"
    | "reward"
    | "warning"
    | "danger"
    | "dangerOutline"
    | "neutral"
    | "ghost"
    | "primary"
    | "secondary";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
};

const variants = {
  constructive:
    "bg-cub-green-bright text-cub-off-white shadow-md shadow-cub-green/25 hover:brightness-110 active:brightness-95 disabled:bg-cub-green-muted disabled:text-cub-muted disabled:shadow-none",
  reward:
    "bg-cub-gold text-cub-ebony shadow-md shadow-cub-gold/30 hover:bg-cub-gold-warm active:brightness-95 disabled:bg-cub-gold-muted disabled:text-cub-muted disabled:shadow-none",
  warning:
    "border border-cub-gold/55 bg-cub-gold-muted text-cub-gold-light shadow-sm shadow-cub-gold/10 hover:border-cub-gold hover:bg-cub-gold-muted active:brightness-95 disabled:opacity-50",
  danger:
    "bg-cub-red-alert text-cub-off-white shadow-md shadow-cub-red/25 hover:brightness-110 active:brightness-95 disabled:bg-cub-red-muted disabled:text-cub-muted disabled:shadow-none",
  dangerOutline:
    "border-2 border-cub-red-alert bg-transparent text-cub-red-light shadow-sm shadow-cub-red/10 hover:bg-cub-red-muted active:brightness-95 disabled:opacity-50",
  neutral:
    "border border-cub-charcoal bg-cub-charcoal text-cub-off-white shadow-sm hover:border-cub-off-white/20 hover:bg-cub-ebony active:brightness-95 disabled:opacity-50",
  ghost:
    "text-cub-muted hover:bg-cub-charcoal hover:text-cub-off-white active:brightness-95 disabled:opacity-50",
  /** @deprecated Use constructive or reward */
  primary:
    "bg-cub-gold text-cub-ebony shadow-md shadow-cub-gold/30 hover:bg-cub-gold-warm active:brightness-95 disabled:bg-cub-gold-muted disabled:text-cub-muted disabled:shadow-none",
  /** @deprecated Use neutral */
  secondary:
    "border border-cub-charcoal bg-cub-charcoal text-cub-off-white shadow-sm hover:border-cub-off-white/20 hover:bg-cub-ebony active:brightness-95 disabled:opacity-50",
};

const sizes = {
  sm: "min-h-9 px-3 py-1.5 text-sm",
  md: "min-h-11 px-4 py-2.5 text-sm",
  lg: "min-h-12 px-5 py-3 text-base font-semibold",
};

export function Button({
  className,
  variant = "constructive",
  size = "md",
  fullWidth = false,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cub-gold-warm/70 focus-visible:ring-offset-2 focus-visible:ring-offset-cub-ebony",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    />
  );
}
