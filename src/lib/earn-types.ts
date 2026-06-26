export const EARN_TYPES = [
  "routine",
  "task",
  "growth_pick",
  "training_path",
  "bonus",
] as const;

export type EarnType = (typeof EARN_TYPES)[number];

export type EarnTypeMeta = {
  id: EarnType;
  label: string;
  shortLabel: string;
  purpose: string;
  explanation: string;
  examples: string[];
  badgeClass: string;
  cardBorderClass: string;
  cardAccentClass: string;
  ctaLabel: string;
  cubCtaLabel: string;
  parentCtaHref: string;
  cubCtaHref: (cubId: string) => string;
};

export const EARN_TYPE_META: Record<EarnType, EarnTypeMeta> = {
  routine: {
    id: "routine",
    label: "Routine",
    shortLabel: "Routine",
    purpose: "Routines are the everyday habits that keep the Cub on track.",
    explanation: "Recurring everyday habits and responsibilities.",
    examples: ["Make bed", "Brush teeth", "Read 20 minutes", "Clean room"],
    badgeClass:
      "bg-sky-950/90 text-sky-200 ring-1 ring-sky-400/35",
    cardBorderClass: "border-sky-500/30",
    cardAccentClass: "from-sky-950/50 to-cub-charcoal",
    ctaLabel: "View routines",
    cubCtaLabel: "View routines",
    parentCtaHref: "/dashboard/tasks?kind=routine",
    cubCtaHref: (cubId) => `/cub/${cubId}/challenges`,
  },
  task: {
    id: "task",
    label: "Task",
    shortLabel: "Task",
    purpose: "Tasks are one-time assignments from a parent or guide.",
    explanation: "One-time parent-assigned responsibilities.",
    examples: [
      "Take out trash",
      "Clean bathroom",
      "Finish missing homework",
      "Help unload groceries",
    ],
    badgeClass:
      "bg-cub-gold-muted text-cub-gold-light ring-1 ring-cub-gold/40",
    cardBorderClass: "border-cub-gold/35",
    cardAccentClass: "from-cub-gold/20 to-cub-charcoal",
    ctaLabel: "Assign a task",
    cubCtaLabel: "View tasks",
    parentCtaHref: "/dashboard/tasks?kind=task",
    cubCtaHref: (cubId) => `/cub/${cubId}/challenges#assignments`,
  },
  growth_pick: {
    id: "growth_pick",
    label: "Growth Pick",
    shortLabel: "Growth Pick",
    purpose:
      "Growth Picks are choice-based activities that help the Cub grow across the five Cub Code areas.",
    explanation:
      "Choice-based personal growth activities across Control, Use, Build, Character, and Wellness.",
    examples: [
      "Lead a family discussion",
      "Try a new healthy recipe",
      "Practice a skill for 30 minutes",
      "Volunteer in the community",
    ],
    badgeClass:
      "bg-cub-green-muted text-cub-green-light ring-1 ring-cub-green-bright/35",
    cardBorderClass: "border-cub-green/35",
    cardAccentClass: "from-cub-green/30 to-cub-charcoal",
    ctaLabel: "Manage Growth Picks",
    cubCtaLabel: "Open Growth Picks",
    parentCtaHref: "/dashboard/focus-deck",
    cubCtaHref: (cubId) => `/cub/${cubId}/focus-deck`,
  },
  training_path: {
    id: "training_path",
    label: "Training Path",
    shortLabel: "Training Path",
    purpose:
      "Training Path is the required lesson journey. Complete each level to unlock the next.",
    explanation:
      "Mandatory linear quest map with locked levels and micro lessons about Black history, identity, culture, and life lessons.",
    examples: [
      "Complete a milestone lesson",
      "Unlock the next level",
      "Submit reflection proof",
      "Earn path rewards",
    ],
    badgeClass:
      "bg-violet-950/90 text-violet-200 ring-1 ring-violet-400/35",
    cardBorderClass: "border-violet-500/35",
    cardAccentClass: "from-violet-950/50 to-cub-charcoal",
    ctaLabel: "Open Training Path",
    cubCtaLabel: "Open Training Path",
    parentCtaHref: "/dashboard/tasks/templates",
    cubCtaHref: (cubId) => `/cub/${cubId}/training`,
  },
  bonus: {
    id: "bonus",
    label: "Bonus",
    shortLabel: "Bonus",
    purpose:
      "Bonus points are extra rewards parents can give when they notice effort, maturity, or something worth celebrating.",
    explanation:
      "Parent-entered extra points for effort, maturity, initiative, or anything worth recognizing.",
    examples: [
      "Showed maturity in a tough moment",
      "Took initiative without being asked",
      "Extra effort on homework",
      "Kindness toward a sibling",
    ],
    badgeClass:
      "bg-amber-950/90 text-amber-200 ring-1 ring-amber-400/35",
    cardBorderClass: "border-amber-500/35",
    cardAccentClass: "from-amber-950/40 to-cub-charcoal",
    ctaLabel: "Award bonus",
    cubCtaLabel: "See your bonuses",
    parentCtaHref: "/dashboard/cubs",
    cubCtaHref: (cubId) => `/cub/${cubId}/progress`,
  },
};

export const DEFAULT_GROWTH_PICK_WEEKLY_MINIMUM = 1;

export function getEarnTypeMeta(earnType: EarnType): EarnTypeMeta {
  return EARN_TYPE_META[earnType];
}

export function parseEarnType(value: string | undefined | null): EarnType | null {
  if (!value) return null;
  return EARN_TYPES.includes(value as EarnType) ? (value as EarnType) : null;
}

export function parseParentAssignKind(value: string | undefined): EarnType {
  return parseEarnType(value) ?? "task";
}

type TaskEarnInput = {
  focusActivityCardId?: string | null;
  trainingDeckId?: string | null;
};

export function getTaskEarnType(task: TaskEarnInput): "task" | "training_path" {
  if (task.trainingDeckId || task.focusActivityCardId) {
    return "training_path";
  }
  return "task";
}

export type EarnItemStatus =
  | "available"
  | "claimed"
  | "in_progress"
  | "submitted"
  | "sent_back"
  | "approved"
  | "completed"
  | "rejected"
  | "rewarded"
  | "pending";

export type EarnItem = {
  id: string;
  earnType: EarnType;
  cubId: string;
  title: string;
  description: string | null;
  points: number;
  status: EarnItemStatus;
  dueDate: Date | null;
  repeat: string | null;
  growthAreas: string[] | null;
  trainingLevelId: string | null;
  trainingLevelTitle: string | null;
  parentNote: string | null;
  href: string;
};
