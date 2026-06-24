export type CouncilDayValueDimension = {
  id: string;
  label: string;
  parentPrompt: string;
  cubPrompt: string;
};

export const COUNCIL_DAY_VALUE_DIMENSIONS: CouncilDayValueDimension[] = [
  {
    id: "timeliness",
    label: "Timeliness",
    parentPrompt: "Did they start and finish on time this week?",
    cubPrompt: "How well did you meet deadlines and show up on time?",
  },
  {
    id: "understanding",
    label: "Understanding",
    parentPrompt: "Did they understand instructions and expectations?",
    cubPrompt: "How well did you understand what was asked of you?",
  },
  {
    id: "listening",
    label: "Listening",
    parentPrompt: "Did they listen and follow household guidance?",
    cubPrompt: "How well did you listen to parents and follow directions?",
  },
  {
    id: "effort",
    label: "Effort",
    parentPrompt: "Did they give honest, full effort on tasks and focus?",
    cubPrompt: "How much real effort did you put into your work this week?",
  },
  {
    id: "respect",
    label: "Respect",
    parentPrompt: "Did they treat family, tasks, and boundaries with respect?",
    cubPrompt: "How respectfully did you treat people and household rules?",
  },
];

export type CouncilDayValueRating = {
  parent: number;
  cub: number;
  comment?: string;
};

export type CouncilDayValueRatings = Record<string, CouncilDayValueRating>;

export const COUNCIL_DAY_RATING_LABELS: Record<number, string> = {
  1: "Needs work",
  2: "Below expectations",
  3: "Meeting expectations",
  4: "Strong",
  5: "Excellent",
};

const COMMENT_MIN_LENGTH = 5;

export function emptyCouncilDayValueRatings(): CouncilDayValueRatings {
  return Object.fromEntries(
    COUNCIL_DAY_VALUE_DIMENSIONS.map((dimension) => [
      dimension.id,
      { parent: 0, cub: 0, comment: "" },
    ]),
  );
}

export function parseCouncilDayValueRatings(
  value: unknown,
): CouncilDayValueRatings {
  const base = emptyCouncilDayValueRatings();

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return base;
  }

  for (const dimension of COUNCIL_DAY_VALUE_DIMENSIONS) {
    const raw = (value as Record<string, unknown>)[dimension.id];
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      continue;
    }

    const record = raw as Record<string, unknown>;
    const parent = Number(record.parent);
    const cub = Number(record.cub);
    const comment =
      typeof record.comment === "string" ? record.comment.trim() : "";

    base[dimension.id] = {
      parent: isValidRating(parent) ? parent : 0,
      cub: isValidRating(cub) ? cub : 0,
      comment,
    };
  }

  return base;
}

export function parseCouncilDayValueRatingsFromFormData(
  formData: FormData,
): CouncilDayValueRatings {
  const ratings = emptyCouncilDayValueRatings();

  for (const dimension of COUNCIL_DAY_VALUE_DIMENSIONS) {
    const parent = Number(formData.get(`rating_parent_${dimension.id}`));
    const cub = Number(formData.get(`rating_cub_${dimension.id}`));
    const comment =
      formData.get(`rating_comment_${dimension.id}`)?.toString().trim() ?? "";

    ratings[dimension.id] = {
      parent: isValidRating(parent) ? parent : 0,
      cub: isValidRating(cub) ? cub : 0,
      comment,
    };
  }

  return ratings;
}

function isValidRating(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}

export function ratingsDiffer(rating: CouncilDayValueRating | undefined): boolean {
  if (!rating) {
    return false;
  }

  return (
    isValidRating(rating.parent) &&
    isValidRating(rating.cub) &&
    rating.parent !== rating.cub
  );
}

export function validateCouncilDayValueRatings(
  ratings: CouncilDayValueRatings,
): string | null {
  for (const dimension of COUNCIL_DAY_VALUE_DIMENSIONS) {
    const rating = ratings[dimension.id];
    if (!rating || !isValidRating(rating.parent)) {
      return `${dimension.label}: parent rating must be 1–5.`;
    }
    if (!isValidRating(rating.cub)) {
      return `${dimension.label}: Cub rating must be 1–5.`;
    }

    if (ratingsDiffer(rating)) {
      const comment = rating.comment?.trim() ?? "";
      if (comment.length < COMMENT_MIN_LENGTH) {
        return `${dimension.label}: add a short comment when parent and Cub ratings differ.`;
      }
    }
  }

  return null;
}

export function areCouncilDayValueRatingsComplete(
  ratings: CouncilDayValueRatings,
): boolean {
  return validateCouncilDayValueRatings(ratings) === null;
}

export function formatCouncilDayRatingSummary(rating: number): string {
  return `${rating}/5 · ${COUNCIL_DAY_RATING_LABELS[rating] ?? ""}`;
}

export function parseFamilyDayBonusField(
  formData: FormData,
  fieldName: string,
  fallback: number,
): number {
  const raw = formData.get(fieldName)?.toString().trim();
  if (!raw) {
    return fallback;
  }

  const value = Number.parseInt(raw, 10);
  if (!Number.isInteger(value) || value < 0 || value > 999) {
    return fallback;
  }

  return value;
}
