import { ChecklistItemContent } from "@/components/checklist-item-content";

type ChecklistDisplayProps = {
  items: string[];
  checked?: Record<string, boolean> | null;
  /** When true, show empty circles instead of checkmarks (task preview). */
  preview?: boolean;
};

export function ChecklistDisplay({
  items,
  checked,
  preview = false,
}: ChecklistDisplayProps) {
  if (items.length === 0) return null;

  return (
    <div className="max-h-96 overflow-y-auto rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
      <p className="mb-2 text-xs text-zinc-500">
        {items.length} item{items.length === 1 ? "" : "s"}
      </p>
      <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
        {items.map((item, index) => (
          <li key={`${index}-${item}`} className="flex gap-2 break-words">
            <span className="shrink-0">
              {preview ? "•" : checked?.[item] ? "✓" : "✗"}
            </span>
            <span className="min-w-0 flex-1 break-words">
              <ChecklistItemContent content={item} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
