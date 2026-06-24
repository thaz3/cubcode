import type {
  GrowthCategory,
  TaskCategory,
  TaskProofType,
} from "@/generated/prisma/client";

export type CategorySuggestion = {
  proofType: TaskProofType;
  proofPrompt: string;
  proofChecklistItems: string[];
  focusMinutesEarned: number;
  phoneMinutesEarned: number;
  xpEarned: number;
  focusTokensEarned: number;
  logInstructions: string;
};

export const TASK_CATEGORY_LABELS: Record<TaskCategory, string> = {
  FOCUS_BLOCK: "Focus Block",
  SCHOOL: "School-based",
  CHORE: "Chore",
  ATTITUDE: "Attitude",
  LEGACY_WEEKLY: "Weekly Legacy",
};

export const GROWTH_CATEGORY_LABELS: Record<GrowthCategory, string> = {
  CONTROL: "Control — focus & self-regulation",
  USE: "Use — learning & intentional tools",
  BUILD: "Build — creating & making",
  CHARACTER: "Character — values & relationships",
  WELLNESS: "Wellness — body, rest & health",
};

export const SCHOOL_SUBCATEGORY_LABELS = {
  HOMEWORK: "Homework",
  STUDY_SKILLS: "Study skills",
  TESTS: "Tests",
} as const;

export type SchoolSubcategory = keyof typeof SCHOOL_SUBCATEGORY_LABELS;

export const CHORE_SUBCATEGORY_LABELS = {
  CLEAN_ROOM: "Clean room",
  TAKE_OUT_TRASH: "Take out trash",
  DISHES: "Dishes",
  LAUNDRY: "Laundry",
  GENERAL: "Other chore",
} as const;

export type ChoreSubcategory = keyof typeof CHORE_SUBCATEGORY_LABELS;

export const ATTITUDE_SUBCATEGORY_LABELS = {
  RESPECTFUL: "Respectful",
  HONEST: "Honest",
  HELPFUL: "Helpful",
} as const;

export type AttitudeSubcategory = keyof typeof ATTITUDE_SUBCATEGORY_LABELS;

export const LEGACY_WEEKLY_SUBCATEGORY_LABELS = {
  HISTORICAL_FIGURE: "Black historical figure",
  ELDER_INTERVIEW: "Elder interview",
  INVENTOR_ARTIST_ORGANIZER: "Inventor, artist, or organizer",
  COMMUNITY_LOCATION: "Community location",
  FAMILY_HISTORY: "Family history",
  PRESENT_DAY_RESPONSIBILITY: "Present-day responsibility",
} as const;

export type LegacyWeeklySubcategory =
  keyof typeof LEGACY_WEEKLY_SUBCATEGORY_LABELS;

const DEFAULT_CHORE_CHECKLIST = [
  "I completed the chore fully",
  "I checked my work before saying done",
  "I put tools and supplies away",
];

const FOCUS_BLOCK_BASE: CategorySuggestion = {
  proofType: "TIME_LOG",
  proofPrompt: "Log how many minutes you focused and what you worked on.",
  proofChecklistItems: [],
  focusMinutesEarned: 30,
  phoneMinutesEarned: 15,
  xpEarned: 10,
  focusTokensEarned: 1,
  logInstructions:
    "Log a Focus Block with duration and note. Pick one of the five growth areas.",
};

const GROWTH_TWEAKS: Partial<
  Record<GrowthCategory, Partial<CategorySuggestion>>
> = {
  CONTROL: {
    proofPrompt: "What did you focus on? How did you stay in control?",
    xpEarned: 10,
  },
  USE: {
    proofPrompt: "What did you learn or practice? How did you use your tools well?",
    xpEarned: 12,
  },
  BUILD: {
    proofType: "SHORT_REFLECTION",
    proofPrompt: "What did you build or create? What was hardest?",
    xpEarned: 15,
  },
  CHARACTER: {
    proofType: "SHORT_REFLECTION",
    proofPrompt: "How did this work grow your character or relationships?",
    xpEarned: 10,
  },
  WELLNESS: {
    proofPrompt: "Log minutes and describe how this supported your body or rest.",
    focusMinutesEarned: 20,
    phoneMinutesEarned: 10,
    xpEarned: 8,
  },
};

const SCHOOL_SUGGESTIONS: Record<SchoolSubcategory, CategorySuggestion> = {
  HOMEWORK: {
    proofType: "SHORT_REFLECTION",
    proofPrompt: "What assignment did you finish? What was still tricky?",
    proofChecklistItems: [],
    focusMinutesEarned: 25,
    phoneMinutesEarned: 12,
    xpEarned: 12,
    focusTokensEarned: 1,
    logInstructions:
      "Log time spent and a short reflection on the homework completed.",
  },
  STUDY_SKILLS: {
    proofType: "TIME_LOG",
    proofPrompt: "What study skill did you practice (notes, flashcards, planning)?",
    proofChecklistItems: [],
    focusMinutesEarned: 20,
    phoneMinutesEarned: 10,
    xpEarned: 10,
    focusTokensEarned: 1,
    logInstructions: "Log study minutes and what skill you practiced.",
  },
  TESTS: {
    proofType: "CHECKLIST",
    proofPrompt: "Complete each step before submitting test prep.",
    proofChecklistItems: [
      "I reviewed the material",
      "I practiced sample questions",
      "I asked for help if I was stuck",
      "I packed what I need for the test",
    ],
    focusMinutesEarned: 30,
    phoneMinutesEarned: 15,
    xpEarned: 15,
    focusTokensEarned: 1,
    logInstructions: "Check off each prep step and log total prep time.",
  },
};

const CHORE_SUGGESTIONS: Record<ChoreSubcategory, CategorySuggestion> = {
  CLEAN_ROOM: {
    proofType: "CHECKLIST",
    proofPrompt: "Complete each item before submitting.",
    proofChecklistItems: [
      "Floor is clear",
      "Bed is made",
      "Surfaces are wiped",
      "Laundry is in the hamper",
    ],
    focusMinutesEarned: 20,
    phoneMinutesEarned: 10,
    xpEarned: 8,
    focusTokensEarned: 1,
    logInstructions: "Check off each part of the room and note time spent.",
  },
  TAKE_OUT_TRASH: {
    proofType: "CHECKLIST",
    proofPrompt: "Complete each step.",
    proofChecklistItems: [
      "All bins emptied",
      "New bags in place",
      "Bins returned to their spot",
    ],
    focusMinutesEarned: 10,
    phoneMinutesEarned: 5,
    xpEarned: 5,
    focusTokensEarned: 1,
    logInstructions: "Check off each step when the chore is done.",
  },
  DISHES: {
    proofType: "CHECKLIST",
    proofPrompt: "Complete each step.",
    proofChecklistItems: [
      "Dishes washed or loaded",
      "Counters wiped",
      "Sink cleared",
    ],
    focusMinutesEarned: 15,
    phoneMinutesEarned: 8,
    xpEarned: 6,
    focusTokensEarned: 1,
    logInstructions: "Check off kitchen tasks and log minutes if helpful.",
  },
  LAUNDRY: {
    proofType: "CHECKLIST",
    proofPrompt: "Complete each step.",
    proofChecklistItems: [
      "Laundry sorted and started",
      "Clean clothes folded or hung",
      "Laundry put away",
    ],
    focusMinutesEarned: 25,
    phoneMinutesEarned: 12,
    xpEarned: 10,
    focusTokensEarned: 1,
    logInstructions: "Check off laundry steps through put-away.",
  },
  GENERAL: {
    proofType: "CHECKLIST",
    proofPrompt: "Complete each item before submitting.",
    proofChecklistItems: DEFAULT_CHORE_CHECKLIST,
    focusMinutesEarned: 15,
    phoneMinutesEarned: 8,
    xpEarned: 6,
    focusTokensEarned: 1,
    logInstructions: "Use the checklist and note what chore was completed.",
  },
};

const ATTITUDE_SUGGESTIONS: Record<AttitudeSubcategory, CategorySuggestion> = {
  RESPECTFUL: {
    proofType: "SHORT_REFLECTION",
    proofPrompt: "Describe a moment today when you were respectful. Who was involved?",
    proofChecklistItems: [],
    focusMinutesEarned: 5,
    phoneMinutesEarned: 5,
    xpEarned: 10,
    focusTokensEarned: 1,
    logInstructions:
      "Write a short example of respectful behavior a parent can confirm.",
  },
  HONEST: {
    proofType: "SHORT_REFLECTION",
    proofPrompt: "Describe a moment you chose honesty, even when it was hard.",
    proofChecklistItems: [],
    focusMinutesEarned: 5,
    phoneMinutesEarned: 5,
    xpEarned: 12,
    focusTokensEarned: 1,
    logInstructions:
      "Write a short honest moment a parent can discuss with you.",
  },
  HELPFUL: {
    proofType: "SHORT_REFLECTION",
    proofPrompt: "What did you do to help someone without being asked?",
    proofChecklistItems: [],
    focusMinutesEarned: 5,
    phoneMinutesEarned: 5,
    xpEarned: 10,
    focusTokensEarned: 1,
    logInstructions:
      "Describe how you were helpful so a parent can verify.",
  },
};

const LEGACY_WEEKLY_SUGGESTIONS: Record<
  LegacyWeeklySubcategory,
  CategorySuggestion
> = {
  HISTORICAL_FIGURE: {
    proofType: "SHORT_REFLECTION",
    proofPrompt:
      "Who did you learn about? Share two facts and one lesson you take from their life.",
    proofChecklistItems: [],
    focusMinutesEarned: 30,
    phoneMinutesEarned: 12,
    xpEarned: 15,
    focusTokensEarned: 1,
    logInstructions:
      "Write a short reflection a parent can discuss with you after learning together.",
  },
  ELDER_INTERVIEW: {
    proofType: "SHORT_REFLECTION",
    proofPrompt:
      "Who did you interview? What story or advice will you remember and why?",
    proofChecklistItems: [],
    focusMinutesEarned: 25,
    phoneMinutesEarned: 12,
    xpEarned: 15,
    focusTokensEarned: 1,
    logInstructions:
      "Summarize the interview so a parent can confirm you listened and engaged.",
  },
  INVENTOR_ARTIST_ORGANIZER: {
    proofType: "SHORT_REFLECTION",
    proofPrompt:
      "Who did you research? What did they create or change, and how does that inspire you?",
    proofChecklistItems: [],
    focusMinutesEarned: 30,
    phoneMinutesEarned: 12,
    xpEarned: 15,
    focusTokensEarned: 1,
    logInstructions:
      "Describe your research and what you learned about their contribution.",
  },
  COMMUNITY_LOCATION: {
    proofType: "CHECKLIST",
    proofPrompt: "Complete each step with a parent before submitting.",
    proofChecklistItems: [
      "I visited the location with parent supervision",
      "I noticed something meaningful about the place or people there",
      "I can name one way this place matters to our community",
    ],
    focusMinutesEarned: 20,
    phoneMinutesEarned: 10,
    xpEarned: 12,
    focusTokensEarned: 1,
    logInstructions:
      "Check off each step after your visit and add a short note if helpful.",
  },
  FAMILY_HISTORY: {
    proofType: "SHORT_REFLECTION",
    proofPrompt:
      "What family story, tradition, or value did you explore? Why does it matter to you?",
    proofChecklistItems: [],
    focusMinutesEarned: 25,
    phoneMinutesEarned: 12,
    xpEarned: 15,
    focusTokensEarned: 1,
    logInstructions:
      "Reflect on family history so a parent can talk through it with you.",
  },
  PRESENT_DAY_RESPONSIBILITY: {
    proofType: "SHORT_REFLECTION",
    proofPrompt:
      "What responsibility are you carrying forward? Give one example of how you showed it this week.",
    proofChecklistItems: [],
    focusMinutesEarned: 20,
    phoneMinutesEarned: 10,
    xpEarned: 12,
    focusTokensEarned: 1,
    logInstructions:
      "Connect history or family legacy to a choice you made this week.",
  },
};

export function getCategorySuggestions(
  category: TaskCategory,
  options?: {
    subcategory?: string | null;
    growthCategory?: GrowthCategory | null;
  },
): CategorySuggestion {
  const subcategory = options?.subcategory ?? null;
  const growthCategory = options?.growthCategory ?? null;

  switch (category) {
    case "FOCUS_BLOCK": {
      const base = { ...FOCUS_BLOCK_BASE };
      if (growthCategory && GROWTH_TWEAKS[growthCategory]) {
        return { ...base, ...GROWTH_TWEAKS[growthCategory] };
      }
      return base;
    }
    case "SCHOOL":
      if (subcategory && subcategory in SCHOOL_SUGGESTIONS) {
        return SCHOOL_SUGGESTIONS[subcategory as SchoolSubcategory];
      }
      return SCHOOL_SUGGESTIONS.HOMEWORK;
    case "CHORE":
      if (subcategory && subcategory in CHORE_SUGGESTIONS) {
        return CHORE_SUGGESTIONS[subcategory as ChoreSubcategory];
      }
      return CHORE_SUGGESTIONS.GENERAL;
    case "ATTITUDE":
      if (subcategory && subcategory in ATTITUDE_SUGGESTIONS) {
        return ATTITUDE_SUGGESTIONS[subcategory as AttitudeSubcategory];
      }
      return ATTITUDE_SUGGESTIONS.RESPECTFUL;
    case "LEGACY_WEEKLY":
      if (subcategory && subcategory in LEGACY_WEEKLY_SUGGESTIONS) {
        return LEGACY_WEEKLY_SUGGESTIONS[subcategory as LegacyWeeklySubcategory];
      }
      return LEGACY_WEEKLY_SUGGESTIONS.HISTORICAL_FIGURE;
    default:
      return CHORE_SUGGESTIONS.GENERAL;
  }
}

export function formatTaskCategory(
  category: TaskCategory,
  options?: {
    subcategory?: string | null;
    growthCategory?: GrowthCategory | null;
  },
): string {
  const base = TASK_CATEGORY_LABELS[category];
  if (category === "FOCUS_BLOCK" && options?.growthCategory) {
    return `${base} · ${GROWTH_CATEGORY_LABELS[options.growthCategory].split(" —")[0]}`;
  }
  if (options?.subcategory) {
    const label = formatSubcategory(category, options.subcategory);
    if (label) return `${base} · ${label}`;
  }
  return base;
}

export function formatSubcategory(
  category: TaskCategory,
  subcategory: string,
): string | null {
  switch (category) {
    case "SCHOOL":
      return (
        SCHOOL_SUBCATEGORY_LABELS[subcategory as SchoolSubcategory] ?? subcategory
      );
    case "CHORE":
      return (
        CHORE_SUBCATEGORY_LABELS[subcategory as ChoreSubcategory] ?? subcategory
      );
    case "ATTITUDE":
      return (
        ATTITUDE_SUBCATEGORY_LABELS[subcategory as AttitudeSubcategory] ??
        subcategory
      );
    case "LEGACY_WEEKLY":
      return (
        LEGACY_WEEKLY_SUBCATEGORY_LABELS[
          subcategory as LegacyWeeklySubcategory
        ] ?? subcategory
      );
    default:
      return null;
  }
}

export function subcategoryOptions(category: TaskCategory): Array<{
  value: string;
  label: string;
}> {
  switch (category) {
    case "SCHOOL":
      return Object.entries(SCHOOL_SUBCATEGORY_LABELS).map(([value, label]) => ({
        value,
        label,
      }));
    case "CHORE":
      return Object.entries(CHORE_SUBCATEGORY_LABELS).map(([value, label]) => ({
        value,
        label,
      }));
    case "ATTITUDE":
      return Object.entries(ATTITUDE_SUBCATEGORY_LABELS).map(
        ([value, label]) => ({ value, label }),
      );
    case "LEGACY_WEEKLY":
      return Object.entries(LEGACY_WEEKLY_SUBCATEGORY_LABELS).map(
        ([value, label]) => ({ value, label }),
      );
    default:
      return [];
  }
}

export function growthCategoryOptions(): Array<{
  value: GrowthCategory;
  label: string;
}> {
  return (
    Object.entries(GROWTH_CATEGORY_LABELS) as Array<[GrowthCategory, string]>
  ).map(([value, label]) => ({ value, label }));
}
