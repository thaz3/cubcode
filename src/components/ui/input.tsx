import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full min-h-11 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-base text-zinc-100 outline-none ring-amber-500 placeholder:text-zinc-500 focus:ring-2",
        className,
      )}
      {...props}
    />
  );
}
