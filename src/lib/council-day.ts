import type { AgeBand, Cub } from "@/generated/prisma/client";
import { AGE_BAND_DEFAULTS } from "@/lib/age-band-defaults";
import {
  parseCouncilDayValueRatings,
  type CouncilDayValueRatings,
  validateCouncilDayValueRatings,
} from "@/lib/council-day-values";

export type CouncilDayPrompt = {
  id: string;
  label: string;
  question: string;
  field: "winNote" | "growNote" | "familyGoalNote" | "reflection";
  minLength?: number;
};

const COUNCIL_DAY_PROMPTS: Record<AgeBand, CouncilDayPrompt[]> = {
  LITTLE_CUBS: [
    {
      id: "win",
      label: "Bright spot",
      question: "What is one thing you did really well this week?",
      field: "winNote",
      minLength: 5,
    },
    {
      id: "kind",
      label: "Kindness",
      question: "How were you kind or helpful to someone in our family?",
      field: "reflection",
      minLength: 5,
    },
    {
      id: "goal",
      label: "Next week",
      question: "What is one small thing you want to try next week?",
      field: "familyGoalNote",
      minLength: 5,
    },
  ],
  CORE_CUBS: [
    {
      id: "win",
      label: "Win",
      question: "What task or focus block are you most proud of this week?",
      field: "winNote",
      minLength: 10,
    },
    {
      id: "grow",
      label: "Grow",
      question: "What was hard this week, and what did you learn from it?",
      field: "growNote",
      minLength: 10,
    },
    {
      id: "reflection",
      label: "Reflection",
      question: "How did you use your earned phone time responsibly?",
      field: "reflection",
      minLength: 10,
    },
    {
      id: "goal",
      label: "Family goal",
      question: "What should our household focus on next week?",
      field: "familyGoalNote",
      minLength: 10,
    },
  ],
  TRAIL_CUBS: [
    {
      id: "win",
      label: "Win",
      question: "What progress are you most proud of this week — tasks, focus, or attitude?",
      field: "winNote",
      minLength: 15,
    },
    {
      id: "grow",
      label: "Grow",
      question: "Where did you fall short, and what will you do differently?",
      field: "growNote",
      minLength: 15,
    },
    {
      id: "reflection",
      label: "Accountability",
      question: "Were you honest about your work and screen-time choices this week?",
      field: "reflection",
      minLength: 15,
    },
    {
      id: "goal",
      label: "Next week",
      question: "Name one real-world goal and one digital-boundary goal for next week.",
      field: "familyGoalNote",
      minLength: 15,
    },
  ],
  LEGACY_BUILDERS: [
    {
      id: "win",
      label: "Win",
      question: "What did you build, finish, or improve this week that matters long-term?",
      field: "winNote",
      minLength: 20,
    },
    {
      id: "grow",
      label: "Grow",
      question: "What habit or choice held you back, and how will you repair it?",
      field: "growNote",
      minLength: 20,
    },
    {
      id: "reflection",
      label: "Leadership",
      question: "How did you contribute to your family or community offline this week?",
      field: "reflection",
      minLength: 20,
    },
    {
      id: "goal",
      label: "Commitment",
      question: "What commitment will you make for next week — school, work, wellness, or family?",
      field: "familyGoalNote",
      minLength: 20,
    },
  ],
};

const COUNCIL_DAY_BONUSES: Record<
  AgeBand,
  { xp: number; focusTokens: number; phoneMinutes: number }
> = {
  LITTLE_CUBS: { xp: 5, focusTokens: 0, phoneMinutes: 5 },
  CORE_CUBS: { xp: 10, focusTokens: 1, phoneMinutes: 10 },
  TRAIL_CUBS: { xp: 15, focusTokens: 1, phoneMinutes: 15 },
  LEGACY_BUILDERS: { xp: 20, focusTokens: 1, phoneMinutes: 15 },
};

export function getCouncilDayPrompts(ageBand: AgeBand): CouncilDayPrompt[] {
  return COUNCIL_DAY_PROMPTS[ageBand];
}

export function getCouncilDayBonus(ageBand: AgeBand) {
  return COUNCIL_DAY_BONUSES[ageBand];
}

export function getCouncilDayDurationLabel(ageBand: AgeBand): string {
  const minutes = AGE_BAND_DEFAULTS[ageBand].councilDayMinutes;
  return `${minutes} min suggested for Family Day`;
}

/** Monday 00:00:00 local time for the week containing `date`. */
export function getWeekStart(date = new Date()): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekEnd(weekStart: Date): Date {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 7);
  return end;
}

export function parseWeekParam(value: string | undefined): Date {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return getWeekStart();
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(year!, month! - 1, day!);
  if (Number.isNaN(parsed.getTime())) {
    return getWeekStart();
  }

  return getWeekStart(parsed);
}

export function formatWeekParam(weekStart: Date): string {
  const year = weekStart.getFullYear();
  const month = String(weekStart.getMonth() + 1).padStart(2, "0");
  const day = String(weekStart.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatWeekLabel(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const startFmt = weekStart.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const endFmt = weekEnd.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${startFmt} – ${endFmt}`;
}

export function shiftWeek(weekStart: Date, weeks: number): Date {
  const next = new Date(weekStart);
  next.setDate(next.getDate() + weeks * 7);
  return next;
}

export type CubWeekStats = {
  completedTasks: number;
  completedFocusTasks: number;
  focusMinutes: number;
  submittedAwaitingReview: number;
};

export type CouncilDayCubEntryInput = {
  winNote?: string | null;
  growNote?: string | null;
  familyGoalNote?: string | null;
  reflection?: string | null;
  valueRatings?: CouncilDayValueRatings | null;
};

export function validateCouncilDayCubEntry(
  cub: Pick<Cub, "ageBand">,
  input: CouncilDayCubEntryInput,
): string | null {
  const prompts = getCouncilDayPrompts(cub.ageBand);

  for (const prompt of prompts) {
    const value = input[prompt.field]?.trim() ?? "";
    const min = prompt.minLength ?? 5;
    if (value.length < min) {
      return `${prompt.label}: answer in at least ${min} characters.`;
    }
  }

  const ratingsError = validateCouncilDayValueRatings(
    input.valueRatings ?? parseCouncilDayValueRatings(null),
  );
  if (ratingsError) {
    return ratingsError;
  }

  return null;
}

export function isCouncilDayEntryComplete(
  cub: Pick<Cub, "ageBand">,
  entry: CouncilDayCubEntryInput | null | undefined,
): boolean {
  if (!entry) {
    return false;
  }

  return validateCouncilDayCubEntry(cub, entry) === null;
}
