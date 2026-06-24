import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
};

const variants = {
  primary:
    "bg-amber-600 text-white hover:bg-amber-500 active:bg-amber-700 disabled:bg-amber-900 disabled:text-amber-400",
  secondary:
    "border border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 active:bg-zinc-950 disabled:opacity-50",
  ghost:
    "text-zinc-300 hover:bg-zinc-800 active:bg-zinc-900 disabled:opacity-50",
  danger:
    "bg-red-600 text-white hover:bg-red-500 active:bg-red-700 disabled:bg-red-900 disabled:text-red-400",
};

const sizes = {
  sm: "min-h-9 px-3 py-1.5 text-sm",
  md: "min-h-11 px-4 py-2.5 text-sm",
  lg: "min-h-12 px-5 py-3 text-base",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  fullWidth = false,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    />
  );
}
