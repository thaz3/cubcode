import { cn } from "@/lib/utils";

export type RadioChoiceOption<T extends string = string> = {
  value: T;
  label: string;
  description?: string;
};

type RadioChoiceListProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: readonly RadioChoiceOption<T>[];
  name?: string;
  className?: string;
  layout?: "list" | "compact";
};

export function RadioChoiceList<T extends string>({
  value,
  onChange,
  options,
  name,
  className,
  layout = "list",
}: RadioChoiceListProps<T>) {
  const compact = layout === "compact";

  return (
    <div
      className={cn(
        compact
          ? "grid grid-cols-2 gap-1.5 sm:grid-cols-3"
          : "grid gap-2",
        className,
      )}
      role="radiogroup"
      aria-label={name}
    >
      {options.map((option) => {
        const selected = value === option.value;

        return (
          <label
            key={option.value}
            className={cn(
              "cursor-pointer border transition",
              compact
                ? cn(
                    "flex min-h-9 items-center justify-center rounded-lg px-2 py-1.5 text-center text-xs font-medium leading-tight sm:text-sm",
                    selected
                      ? "border-amber-600/70 bg-amber-950/40 text-amber-400"
                      : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-600",
                  )
                : cn(
                    "flex min-h-11 items-start gap-3 rounded-lg px-3 py-2.5",
                    selected
                      ? "border-amber-600/60 bg-amber-50/60 dark:bg-amber-950/30"
                      : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900",
                  ),
            )}
          >
            <input
              type="radio"
              name={name}
              checked={selected}
              onChange={() => onChange(option.value)}
              className={cn(
                "accent-amber-600",
                compact ? "sr-only" : "mt-0.5 size-4 shrink-0",
              )}
            />
            <span className={cn("min-w-0", compact ? "" : "flex-1")}>
              <span
                className={cn(
                  compact
                    ? "text-inherit"
                    : "block text-sm leading-snug text-zinc-900 dark:text-zinc-100",
                )}
              >
                {option.label}
              </span>
              {!compact && option.description ? (
                <span className="mt-0.5 block text-xs leading-snug text-zinc-500">
                  {option.description}
                </span>
              ) : null}
            </span>
          </label>
        );
      })}
    </div>
  );
}
