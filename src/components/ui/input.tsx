import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full min-h-11 touch-manipulation rounded-xl border border-zinc-700 bg-cub-ebony px-4 py-2.5 text-base text-zinc-100 outline-none ring-cub-gold placeholder:text-zinc-500 focus:ring-2",
        className,
      )}
      {...props}
    />
  );
}
