import type {
  GrowthCategory,
  TaskCategory,
  TaskProofType,
} from "@/generated/prisma/client";
import { ALL_GROWTH_AREAS } from "@/lib/unified-growth-areas";

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
  LEGACY_WEEKLY: "Know Your Roots",
  SUMMER_LITE: "Get Some Sun",
};

export const ALL_GROWTH_CATEGORIES = ALL_GROWTH_AREAS;

export const GROWTH_CATEGORY_LABELS: Record<GrowthCategory, string> = {
  MIND: "Mind Code — learning, reading, school, curiosity",
  BODY: "Body Code — health, movement, sleep, hygiene",
  CHARACTER: "Character Code — honesty, courage, respect, humility",
  RESPONSIBILITY: "Duty Code — chores, routines, promises",
  CREATIVITY: "Creativity Code — art, music, writing, dance",
  FAMILY: "Family Code — history, elders, ancestors, sacrifice",
  COMMUNITY: "Community Code — service, leadership, justice",
};

export const GROWTH_CATEGORY_TAGLINES: Record<GrowthCategory, string> = {
  MIND: "Raising a child who can think for themselves.",
  BODY: "Caring for the body is part of self-respect.",
  CHARACTER: "Who are you when nobody is watching?",
  RESPONSIBILITY: "Parenting becomes practice. Not lectures. Daily proof.",
  CREATIVITY:
    "Turning struggle into beauty, language, movement, style, and invention.",
  FAMILY:
    "Rooted in Black family tradition — not just self-improvement.",
  COMMUNITY: "Connected to something bigger than themselves.",
};

export const GROWTH_CATEGORY_FOCUS: Record<GrowthCategory, string> = {
  MIND: "Learning, reading, school, curiosity, critical thinking, problem-solving",
  BODY: "Health, movement, sleep, hygiene, food, discipline, physical confidence",
  CHARACTER: "Honesty, courage, respect, humility, kindness, emotional control",
  RESPONSIBILITY:
    "Chores, routines, promises, time management, accountability, taking care of belongings",
  CREATIVITY:
    "Art, music, writing, dance, building, imagination, storytelling, performance",
  FAMILY:
    "Learning family history, helping at home, listening to elders, honoring ancestors, understanding sacrifice",
  COMMUNITY:
    "Service, leadership, neighborhood pride, justice, contribution, knowing your role",
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

export const SUMMER_LITE_SUBCATEGORY_LABELS = {
  PARK: "Park",
  LIBRARY: "Library",
  WALKING_OBSERVATION: "Walking observation",
  FAMILY_HISTORY_OUTDOOR: "Family history outdoors",
  CREATIVE_OUTDOOR: "Creative outdoor",
  COMMUNITY_SERVICE: "Community service",
} as const;

export type SummerLiteSubcategory = keyof typeof SUMMER_LITE_SUBCATEGORY_LABELS;

const DEFAULT_CHORE_CHECKLIST = [
  "I completed the chore fully",
  "I checked my work before saying done",
  "I put tools and supplies away",
];

const FOCUS_BLOCK_BASE: CategorySuggestion = {
  proofType: "SHORT_REFLECTION",
  proofPrompt:
    "What did you focus on? Upload to Drive or iCloud, tap Share → Copy link, then paste it when you submit.",
  proofChecklistItems: [],
  focusMinutesEarned: 30,
  phoneMinutesEarned: 15,
  xpEarned: 10,
  focusTokensEarned: 1,
  logInstructions:
    "Open instructions to start a request timer, then submit a short reflection and a share link to your proof. Pick a different growth area each week — you earn rewards across all areas your parent requires.",
};

const GROWTH_TWEAKS: Partial<
  Record<GrowthCategory, Partial<CategorySuggestion>>
> = {
  MIND: {
    proofPrompt: "What did you learn or figure out? What question are you still curious about?",
    xpEarned: 12,
  },
  BODY: {
    proofPrompt: "Log minutes and describe how this supported your body, rest, or health.",
    focusMinutesEarned: 20,
    phoneMinutesEarned: 10,
    xpEarned: 8,
  },
  RESPONSIBILITY: {
    proofPrompt: "What did you focus on? How did you stay responsible and on track?",
    xpEarned: 10,
  },
  CREATIVITY: {
    proofPrompt: "What did you learn, build, or create? What was hardest?",
    xpEarned: 12,
  },
  CHARACTER: {
    proofType: "SHORT_REFLECTION",
    proofPrompt: "How did this work grow your character or relationships?",
    xpEarned: 10,
  },
  FAMILY: {
    proofType: "SHORT_REFLECTION",
    proofPrompt: "What family story, tradition, or elder wisdom did this connect to?",
    xpEarned: 12,
  },
  COMMUNITY: {
    proofType: "SHORT_REFLECTION",
    proofPrompt: "How did this help your neighbors or community?",
    xpEarned: 12,
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

const SUMMER_LITE_SUGGESTIONS: Record<SummerLiteSubcategory, CategorySuggestion> =
  {
    PARK: {
      proofType: "CHECKLIST",
      proofPrompt: "Complete each step with a parent before submitting.",
      proofChecklistItems: [
        "A parent approved the park and supervision level",
        "I named the park or location we visited",
        "I noticed and can describe one thing about the park",
      ],
      focusMinutesEarned: 20,
      phoneMinutesEarned: 12,
      xpEarned: 12,
      focusTokensEarned: 1,
      logInstructions:
        "Outdoor park tasks need parent approval for location and supervision before you go.",
    },
    LIBRARY: {
      proofType: "SHORT_REFLECTION",
      proofPrompt:
        "Which library did you visit? What did you read, borrow, or learn there?",
      proofChecklistItems: [],
      focusMinutesEarned: 25,
      phoneMinutesEarned: 12,
      xpEarned: 12,
      focusTokensEarned: 1,
      logInstructions:
        "Name the library branch and what you did there so a parent can confirm.",
    },
    WALKING_OBSERVATION: {
      proofType: "SHORT_REFLECTION",
      proofPrompt:
        "Where did you walk? What did you observe that you had not noticed before?",
      proofChecklistItems: [],
      focusMinutesEarned: 15,
      phoneMinutesEarned: 10,
      xpEarned: 10,
      focusTokensEarned: 1,
      logInstructions:
        "Describe your walking route and one observation from the neighborhood.",
    },
    FAMILY_HISTORY_OUTDOOR: {
      proofType: "SHORT_REFLECTION",
      proofPrompt:
        "Where were you? What family story or tradition did you explore and why does it matter?",
      proofChecklistItems: [],
      focusMinutesEarned: 25,
      phoneMinutesEarned: 12,
      xpEarned: 15,
      focusTokensEarned: 1,
      logInstructions:
        "Share where you were and the family story you explored with a parent.",
    },
    CREATIVE_OUTDOOR: {
      proofType: "PARENT_APPROVAL",
      proofPrompt:
        "A parent confirms you completed the outdoor creative project you planned together.",
      proofChecklistItems: [],
      focusMinutesEarned: 30,
      phoneMinutesEarned: 15,
      xpEarned: 15,
      focusTokensEarned: 1,
      logInstructions:
        "Plan the outdoor project with a parent first, then submit for approval when done.",
    },
    COMMUNITY_SERVICE: {
      proofType: "CHECKLIST",
      proofPrompt: "Complete each step with a parent before submitting.",
      proofChecklistItems: [
        "A parent approved the service task and location",
        "I completed the agreed service work",
        "I can describe how it helped someone or the community",
      ],
      focusMinutesEarned: 25,
      phoneMinutesEarned: 12,
      xpEarned: 15,
      focusTokensEarned: 1,
      logInstructions:
        "Service tasks need a parent-approved plan and location before you start.",
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
    case "SUMMER_LITE":
      if (subcategory && subcategory in SUMMER_LITE_SUGGESTIONS) {
        return SUMMER_LITE_SUGGESTIONS[subcategory as SummerLiteSubcategory];
      }
      return SUMMER_LITE_SUGGESTIONS.PARK;
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
    case "SUMMER_LITE":
      return (
        SUMMER_LITE_SUBCATEGORY_LABELS[subcategory as SummerLiteSubcategory] ??
        subcategory
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
    case "SUMMER_LITE":
      return Object.entries(SUMMER_LITE_SUBCATEGORY_LABELS).map(
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

export function growthCategoryShortLabel(category: GrowthCategory): string {
  return GROWTH_CATEGORY_LABELS[category].split(" —")[0] ?? category;
}

export function growthCategoryDescription(category: GrowthCategory): string {
  return `${GROWTH_CATEGORY_TAGLINES[category]} Focus: ${GROWTH_CATEGORY_FOCUS[category]}.`;
}
