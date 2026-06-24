import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-amber-500 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100",
        className,
      )}
      {...props}
    />
  );
}
