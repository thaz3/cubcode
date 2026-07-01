import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ALL_FOCUS_DECK_CATEGORIES,
  FOCUS_DECK_CATEGORY_LABELS,
  type FocusDeckCategoryPoints,
} from "@/lib/focus-deck-categories";

type FocusDeckCategoryFieldsProps = {
  initialPoints?: FocusDeckCategoryPoints;
};

export function FocusDeckCategoryFields({
  initialPoints,
}: FocusDeckCategoryFieldsProps) {
  return (
    <div className="space-y-3 rounded-lg border border-cub-charcoal bg-cub-ebony/40 p-4">
      <div>
        <h4 className="text-sm font-medium text-cub-off-white">Cub Code points</h4>
        <p className="mt-1 text-sm text-cub-muted">
          Most Growth Picks touch 1–3 Cub Codes. Points add to the weekly Growth Chart after
          approval.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ALL_FOCUS_DECK_CATEGORIES.map((category) => (
          <div key={category}>
            <Label htmlFor={`categoryPoints-${category}`}>
              {FOCUS_DECK_CATEGORY_LABELS[category]}
            </Label>
            <Input
              id={`categoryPoints-${category}`}
              name={`categoryPoints.${category.toLowerCase()}`}
              type="number"
              min={0}
              max={10}
              defaultValue={initialPoints?.[category] ?? ""}
              placeholder="0"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
