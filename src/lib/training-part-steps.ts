import type {
  TrainingDeckCardDefinition,
  TrainingLabStepDefinition,
  TrainingPartStepDefinition,
  TrainingPartStepType,
} from "@/lib/training-deck-definitions";

const LAB_STEP_TYPE_MAP: Record<
  TrainingLabStepDefinition["type"],
  TrainingPartStepType
> = {
  PBS: "LEARN",
  WORKSHEET: "REFLECT",
  LAB: "BUILD",
};

function labStepToMissionStep(step: TrainingLabStepDefinition): TrainingPartStepDefinition {
  return {
    type: LAB_STEP_TYPE_MAP[step.type],
    stepKind: step.type,
    title: step.title,
    helperText: step.description,
    buttonLabel: step.buttonLabel,
    href: step.url,
    fallbackUrl: step.fallbackUrl,
    teacherCode: step.teacherCode,
    external: step.type === "PBS" && Boolean(step.url),
  };
}

const STEP_PREFIX_MAP: Array<{
  prefix: string;
  type: TrainingPartStepType;
  buttonLabel: string;
  helperText: string;
}> = [
  {
    prefix: "Assignment:",
    type: "LEARN",
    buttonLabel: "Open PBS Assignment",
    helperText:
      "Start with the source lesson. Watch, read, and capture the ideas that matter most.",
  },
  {
    prefix: "Worksheet:",
    type: "REFLECT",
    buttonLabel: "Start Worksheet",
    helperText:
      "Complete the reflection questions and explain what you learned from the source material.",
  },
  {
    prefix: "Lab:",
    type: "BUILD",
    buttonLabel: "Launch Lab",
    helperText:
      "Enter the Liberation Lab and build the artifact for this part of the milestone.",
  },
];

function parsePartItemToStep(item: string): TrainingPartStepDefinition {
  const match = STEP_PREFIX_MAP.find((entry) => item.startsWith(entry.prefix));

  if (!match) {
    return {
      type: "LEARN",
      title: item,
      helperText: "Complete this step before moving to the next one.",
      buttonLabel: "Open Step",
    };
  }

  const title = item.slice(match.prefix.length).trim();
  const buttonLabel =
    match.type === "BUILD" && title.length > 0
      ? `Launch ${title.includes("Lab") ? title : `${title} Lab`}`
      : match.buttonLabel;

  return {
    type: match.type,
    title,
    helperText: match.helperText,
    buttonLabel,
  };
}

export function getPartMissionSteps(
  card: Pick<
    TrainingDeckCardDefinition,
    "labSteps" | "partSteps" | "partItems" | "instructions"
  >,
): TrainingPartStepDefinition[] {
  if (card.labSteps && card.labSteps.length > 0) {
    return card.labSteps.map(labStepToMissionStep);
  }

  if (card.partSteps && card.partSteps.length > 0) {
    return card.partSteps;
  }

  if (card.partItems && card.partItems.length > 0) {
    return card.partItems.map(parsePartItemToStep);
  }

  return [
    {
      type: "LEARN",
      title: "Mission steps",
      helperText: card.instructions,
      buttonLabel: "Open Step",
    },
  ];
}

export const PART_STEP_TYPE_STYLES: Record<
  TrainingPartStepType,
  { badge: string; card: string; button: string }
> = {
  LEARN: {
    badge: "bg-sky-500/25 text-sky-100 ring-1 ring-sky-300/50",
    card: "border-sky-500/40 bg-gradient-to-br from-slate-900 via-sky-950 to-indigo-950",
    button: "bg-sky-600 hover:bg-sky-500",
  },
  REFLECT: {
    badge: "bg-amber-500/25 text-amber-100 ring-1 ring-amber-300/50",
    card: "border-amber-500/40 bg-gradient-to-br from-slate-900 via-amber-950 to-orange-950",
    button: "bg-amber-600 hover:bg-amber-500",
  },
  BUILD: {
    badge: "bg-violet-500/25 text-violet-100 ring-1 ring-violet-300/50",
    card: "border-violet-500/40 bg-gradient-to-br from-slate-900 via-violet-950 to-fuchsia-950",
    button: "bg-violet-600 hover:bg-violet-500",
  },
};
