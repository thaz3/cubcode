import { cn } from "@/lib/utils";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  const hasTextColor = className?.includes("text-");

  return (
    <label
      className={cn(
        "mb-1.5 block text-sm font-medium",
        !hasTextColor && "text-zinc-200",
        className,
      )}
      {...props}
    />
  );
}
