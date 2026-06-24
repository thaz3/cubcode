"use client";

import {
  COUNCIL_DAY_RATING_LABELS,
  COUNCIL_DAY_VALUE_DIMENSIONS,
  ratingsDiffer,
  type CouncilDayValueRatings,
} from "@/lib/council-day-values";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState } from "react";

type CouncilDayValueRatingsFieldsProps = {
  cubId: string;
  initialRatings: CouncilDayValueRatings;
  readOnly?: boolean;
};

export function CouncilDayValueRatingsFields({
  cubId,
  initialRatings,
  readOnly = false,
}: CouncilDayValueRatingsFieldsProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  if (readOnly) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Values & expectations (1–5)
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            Parent view and Cub self-rating for the week.
          </p>
        </div>
        <ul className="space-y-3">
          {COUNCIL_DAY_VALUE_DIMENSIONS.map((dimension) => {
            const rating = initialRatings[dimension.id];
            if (!rating) {
              return null;
            }

            return (
              <li
                key={dimension.id}
                className="rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800"
              >
                <p className="font-medium text-zinc-800 dark:text-zinc-200">
                  {dimension.label}
                </p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Parent: {rating.parent}/5 · Cub: {rating.cub}/5
                </p>
                {rating.comment ? (
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <span className="font-medium">Note: </span>
                    {rating.comment}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-violet-200 bg-violet-50/50 p-4 dark:border-violet-900 dark:bg-violet-950/20">
      <div>
        <h3 className="text-sm font-semibold text-violet-950 dark:text-violet-100">
          Values & expectations
        </h3>
        <p className="mt-1 text-xs text-violet-900/80 dark:text-violet-200/80">
          Rate 1–5 together. If parent and Cub scores differ, add a short comment
          to capture the conversation.
        </p>
      </div>

      <div className="space-y-5">
        {COUNCIL_DAY_VALUE_DIMENSIONS.map((dimension) => {
          const rating = initialRatings[dimension.id];
          const showCommentHint = ratingsDiffer(rating);

          return (
            <div
              key={dimension.id}
              className="rounded-lg border border-violet-100 bg-white/60 p-3 dark:border-violet-900/60 dark:bg-zinc-950/40"
            >
              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                {dimension.label}
              </p>
              <RatingRow
                dimensionId={dimension.id}
                side="parent"
                label="Parent"
                prompt={dimension.parentPrompt}
                defaultValue={rating?.parent ?? 0}
                hovered={hovered}
                setHovered={setHovered}
              />
              <RatingRow
                dimensionId={dimension.id}
                side="cub"
                label="Cub"
                prompt={dimension.cubPrompt}
                defaultValue={rating?.cub ?? 0}
                hovered={hovered}
                setHovered={setHovered}
              />
              <div className="mt-3">
                <Label htmlFor={`${cubId}-comment-${dimension.id}`}>
                  Comment
                  {showCommentHint ? (
                    <span className="ml-1 font-normal text-amber-700 dark:text-amber-400">
                      (helpful when ratings differ)
                    </span>
                  ) : null}
                </Label>
                <p className="mt-1 text-xs text-zinc-500">
                  What you discussed — especially if you see it differently.
                </p>
                <textarea
                  id={`${cubId}-comment-${dimension.id}`}
                  name={`rating_comment_${dimension.id}`}
                  defaultValue={rating?.comment ?? ""}
                  rows={2}
                  placeholder="Optional unless parent and Cub ratings differ"
                  className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RatingRow({
  dimensionId,
  side,
  label,
  prompt,
  defaultValue,
  hovered,
  setHovered,
}: {
  dimensionId: string;
  side: "parent" | "cub";
  label: string;
  prompt: string;
  defaultValue: number;
  hovered: string | null;
  setHovered: (value: string | null) => void;
}) {
  const fieldName = `rating_${side}_${dimensionId}`;
  const hoverKey = `${dimensionId}-${side}`;

  return (
    <fieldset className="mt-2">
      <legend className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {label}
      </legend>
      <p className="text-xs text-zinc-500">{prompt}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {[1, 2, 3, 4, 5].map((score) => (
          <label
            key={score}
            className="cursor-pointer"
            onMouseEnter={() => setHovered(`${hoverKey}-${score}`)}
            onMouseLeave={() => setHovered(null)}
          >
            <input
              type="radio"
              name={fieldName}
              value={score}
              defaultChecked={defaultValue === score}
              className="peer sr-only"
            />
            <span
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition",
                "border-zinc-300 bg-white text-zinc-700",
                "peer-checked:border-violet-600 peer-checked:bg-violet-600 peer-checked:text-white",
                "hover:border-violet-400 hover:bg-violet-50",
                "dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200",
                "dark:peer-checked:border-violet-500 dark:peer-checked:bg-violet-500",
                hovered === `${hoverKey}-${score}` &&
                  "border-violet-400 bg-violet-50 dark:bg-violet-950/40",
              )}
            >
              {score}
            </span>
          </label>
        ))}
        <span className="ml-1 self-center text-xs text-zinc-500">
          {defaultValue > 0
            ? COUNCIL_DAY_RATING_LABELS[defaultValue]
            : "Select 1–5"}
        </span>
      </div>
    </fieldset>
  );
}
