import type {
  FocusDeckDifficulty,
  FocusDeckLocationType,
  TaskProofType,
} from "@/generated/prisma/client";
import type { FocusDeckCategoryPoints } from "@/lib/focus-deck-categories";

export type TrainingPartStepType = "LEARN" | "REFLECT" | "BUILD";

export type TrainingLabStepDefinition = {
  type: "PBS" | "WORKSHEET" | "LAB";
  title: string;
  description: string;
  url?: string;
  fallbackUrl?: string;
  teacherCode?: string;
  buttonLabel: string;
};

export type TrainingPartStepDefinition = {
  type: TrainingPartStepType;
  title: string;
  helperText: string;
  buttonLabel: string;
  href?: string;
  stepKind?: TrainingLabStepDefinition["type"];
  fallbackUrl?: string;
  teacherCode?: string;
  external?: boolean;
};

export type TrainingDeckCardDefinition = {
  key: string;
  title: string;
  description: string;
  instructions: string;
  estimatedMinutes: number;
  estimatedMinutesLabel?: string;
  codeRewardsLabel?: string;
  metaRewardsLabel?: string;
  partItems?: string[];
  partSteps?: TrainingPartStepDefinition[];
  labSteps?: TrainingLabStepDefinition[];
  locationType: FocusDeckLocationType;
  difficulty: FocusDeckDifficulty;
  categoryPoints: FocusDeckCategoryPoints;
  proofType: TaskProofType;
  proofPrompt: string;
  xpEarned?: number;
  focusTokensEarned?: number;
  phoneMinutesEarned?: number;
  focusMinutesEarned?: number;
};

export type TrainingDeckDefinition = {
  slug: string;
  milestoneNumber: number;
  title: string;
  description: string;
  cards: TrainingDeckCardDefinition[];
};

export function getTrainingCardDisplayMeta(starterKey: string | null | undefined) {
  if (!starterKey) return null;

  for (const deck of TRAINING_DECK_DEFINITIONS) {
    for (const card of deck.cards) {
      if (`${deck.slug}:${card.key}` === starterKey) {
        return {
          codeRewardsLabel: card.codeRewardsLabel ?? null,
          estimatedMinutesLabel: card.estimatedMinutesLabel ?? null,
          metaRewardsLabel: card.metaRewardsLabel ?? null,
          partItems: card.partItems ?? null,
        };
      }
    }
  }

  return null;
}

export function getTrainingPartDefinition(slug: string, partKey: string) {
  const deck = TRAINING_DECK_DEFINITIONS.find((entry) => entry.slug === slug);
  if (!deck) return null;

  const card = deck.cards.find((entry) => entry.key === partKey);
  if (!card) return null;

  return { deck, card };
}

export const TRAINING_DECK_DEFINITIONS: TrainingDeckDefinition[] = [
  {
    slug: "start-your-code",
    milestoneNumber: 1,
    title: "Freedom for Who?",
    description: "Slavery must end completely.",
    cards: [
      {
        key: "part-1-frederick-douglass",
        title: "Part 1: Frederick Douglass and the Power of Literacy",
        description:
          "Learn how Frederick Douglass used reading, writing, and public voice as tools of freedom.",
        instructions:
          "Complete the PBS assignment, worksheet, and Liberation Lab for Part 1. Submit proof when your parent assigns this part.",
        estimatedMinutes: 52,
        estimatedMinutesLabel: "~45–60 min",
        codeRewardsLabel: "Mind Code +2 · Voice Code +2 · Character Code +1",
        metaRewardsLabel: "150 XP · 5 Focus Tokens",
        partItems: [
          "Assignment: Becoming Frederick Douglass (PBS)",
          "Worksheet: Books Are Power Worksheet",
          "Lab: Frederick Douglass’s Social Media Profile",
        ],
        labSteps: [
          {
            type: "PBS",
            title: "Becoming Frederick Douglass",
            description:
              "Start with the source lesson. Watch, read, and look for how Douglass used literacy as a path to freedom.",
            url: "https://ny.pbslearningmedia.org/student/code/gecko19003/",
            fallbackUrl: "https://ny.pbslearningmedia.org/student/",
            teacherCode: "gecko19003",
            buttonLabel: "Open PBS Assignment ↗",
          },
          {
            type: "WORKSHEET",
            title: "Books Are Power Worksheet",
            description:
              "Reflect on your favorite book, your reading life, and pick a title from the Frederick Douglass reading list.",
            buttonLabel: "Start Worksheet",
          },
          {
            type: "LAB",
            title: "Frederick Douglass’s Social Media Profile",
            description:
              "Build a profile that shows how Douglass controlled his image, words, and public message.",
            buttonLabel: "Launch Profile Lab",
          },
        ],
        locationType: "HOME",
        difficulty: "MEDIUM",
        categoryPoints: { MIND: 2, CREATIVITY: 2, CHARACTER: 1 },
        proofType: "SHORT_REFLECTION",
        proofPrompt: "What did you learn about literacy as a tool of freedom?",
        xpEarned: 150,
        focusTokensEarned: 5,
      },
      {
        key: "part-2-harriet-tubman",
        title: "Part 2: General Harriet Tubman",
        description:
          "Study Harriet Tubman as a strategist, navigator, protector, and field general of freedom.",
        instructions:
          "Complete both PBS assignments and the Liberation Lab for Part 2. Submit proof when your parent assigns this part.",
        estimatedMinutes: 60,
        estimatedMinutesLabel: "~60 min",
        codeRewardsLabel: "Mind Code +2 · Body Code +1 · Character Code +2",
        metaRewardsLabel: "200 XP · 6 Focus Tokens",
        partItems: [
          "Assignment: Black Abolitionists: The Declaration’s Influence (PBS)",
          "Assignment: Harriet Tubman: Visions of Freedom (PBS)",
          "Lab: The North Star Trail",
        ],
        locationType: "HOME",
        difficulty: "MEDIUM",
        categoryPoints: { MIND: 2, BODY: 1, CHARACTER: 2 },
        proofType: "SHORT_REFLECTION",
        proofPrompt: "How did Harriet Tubman lead with strategy and courage?",
        xpEarned: 200,
        focusTokensEarned: 6,
      },
      {
        key: "part-3-freedom-before-permission",
        title: "Part 3: Freedom Before Permission",
        description:
          "Explore how freedom seekers, abolitionists, and record keepers protected stories, names, and family history.",
        instructions:
          "Complete both PBS assignments, the worksheet, and the Liberation Lab for Part 3. Submit proof when your parent assigns this part.",
        estimatedMinutes: 60,
        estimatedMinutesLabel: "~60 min",
        codeRewardsLabel: "Build Code +2 · Mind Code +2 · Character Code +1",
        metaRewardsLabel: "175 XP · 5 Focus Tokens",
        partItems: [
          "Assignment: Let’s Get Free (PBS)",
          "Assignment: The William Still Story (PBS)",
          "Worksheet: Recording History Worksheet",
          "Lab: The Underground Registry",
        ],
        locationType: "HOME",
        difficulty: "MEDIUM",
        categoryPoints: { CREATIVITY: 2, MIND: 2, CHARACTER: 1 },
        proofType: "SHORT_REFLECTION",
        proofPrompt: "What stories or names did you help preserve in this part?",
        xpEarned: 175,
        focusTokensEarned: 5,
      },
      {
        key: "part-4-america-has-a-problem",
        title: "Part 4: America Has A Problem",
        description:
          "Examine how slavery shaped American law, war, citizenship, and the meaning of freedom.",
        instructions:
          "Complete both PBS assignments and the Liberation Lab for Part 4. Submit proof when your parent assigns this part.",
        estimatedMinutes: 67,
        estimatedMinutesLabel: "~60–75 min",
        codeRewardsLabel: "Voice Code +3 · Mind Code +2 · Character Code +1",
        metaRewardsLabel: "250 XP · 8 Focus Tokens",
        partItems: [
          "Assignment: Slavery and the US Constitution (PBS)",
          "Assignment: Slavery and the Civil War (PBS)",
          "Lab: “What to the Slave Is the Fourth of July?”",
        ],
        locationType: "HOME",
        difficulty: "CHALLENGING",
        categoryPoints: { CREATIVITY: 3, MIND: 2, CHARACTER: 1 },
        proofType: "SHORT_REFLECTION",
        proofPrompt: "How did slavery shape law, war, and citizenship in America?",
        xpEarned: 250,
        focusTokensEarned: 8,
      },
    ],
  },
  {
    slug: "build-your-rhythm",
    milestoneNumber: 2,
    title: "Reconstruction: Build Freedom",
    description: "Rebuild communities, rights, and institutions after emancipation.",
    cards: [
      {
        key: "morning-rhythm",
        title: "Design a morning rhythm",
        description: "Plan how you start the day with intention.",
        instructions:
          "Write a simple morning checklist with your parent. Follow it for one day.",
        estimatedMinutes: 25,
        locationType: "HOME",
        difficulty: "EASY",
        categoryPoints: { RESPONSIBILITY: 2, BODY: 1 },
        proofType: "CHECKLIST",
        proofPrompt: "Check off each step and note one thing that helped.",
      },
      {
        key: "study-block",
        title: "Protected study block",
        description: "Practice a distraction-free study session.",
        instructions:
          "Complete 30 minutes of schoolwork or reading with phone away.",
        estimatedMinutes: 30,
        locationType: "HOME",
        difficulty: "MEDIUM",
        categoryPoints: { RESPONSIBILITY: 2, MIND: 1, CHARACTER: 1 },
        proofType: "SHORT_REFLECTION",
        proofPrompt: "What did you study and how did you stay focused?",
      },
      {
        key: "evening-reset",
        title: "Evening reset routine",
        description: "End the day with a calm reset.",
        instructions:
          "Complete your evening routine: prep for tomorrow, tidy one space, and reflect.",
        estimatedMinutes: 20,
        locationType: "HOME",
        difficulty: "EASY",
        categoryPoints: { RESPONSIBILITY: 2, BODY: 1 },
        proofType: "PARENT_APPROVAL",
        proofPrompt: "Parent confirms the evening reset was completed.",
      },
    ],
  },
  {
    slug: "know-your-roots",
    milestoneNumber: 3,
    title: "Harlem Renaissance: Make Culture",
    description: "Create art, music, and ideas that shape the world.",
    cards: [
      {
        key: "roots-figure",
        title: "Research a Black historical figure",
        description: "Learn about someone who shaped history.",
        instructions:
          "Pick a figure, read or watch something about them, and share three facts.",
        estimatedMinutes: 45,
        locationType: "ANY",
        difficulty: "MEDIUM",
        categoryPoints: { CHARACTER: 2, COMMUNITY: 2 },
        proofType: "SHORT_REFLECTION",
        proofPrompt: "Who did you study and what three facts stood out?",
      },
      {
        key: "family-story",
        title: "Capture a family story",
        description: "Connect with family history and identity.",
        instructions:
          "Interview a family member about a memory, tradition, or lesson passed down.",
        estimatedMinutes: 40,
        locationType: "HOME",
        difficulty: "MEDIUM",
        categoryPoints: { CHARACTER: 2, COMMUNITY: 2, CREATIVITY: 1 },
        proofType: "SHORT_REFLECTION",
        proofPrompt: "Summarize the story and why it matters to you.",
      },
      {
        key: "community-pride",
        title: "Community pride reflection",
        description: "Name something in your community you are proud of.",
        instructions:
          "Visit or research a local Black-owned business, institution, or community leader.",
        estimatedMinutes: 35,
        locationType: "COMMUNITY",
        difficulty: "MEDIUM",
        categoryPoints: { COMMUNITY: 3, CHARACTER: 1 },
        proofType: "SHORT_REFLECTION",
        proofPrompt: "What did you learn and what makes you proud?",
      },
    ],
  },
  {
    slug: "get-some-sun",
    milestoneNumber: 4,
    title: "Civil Rights: Move the Nation",
    description: "Organize, protest, and change laws through courage and strategy.",
    cards: [
      {
        key: "sun-community-service",
        title: "Community service outdoors",
        description: "Give back outside with parent supervision.",
        instructions:
          "Complete one outdoor act of service — help a neighbor, clean a shared space, or volunteer with a parent.",
        estimatedMinutes: 60,
        locationType: "OUTDOOR",
        difficulty: "MEDIUM",
        categoryPoints: { COMMUNITY: 3, RESPONSIBILITY: 2, CHARACTER: 1 },
        proofType: "SHORT_REFLECTION",
        proofPrompt: "What service did you do and who did it help?",
      },
      {
        key: "sun-walk-journal",
        title: "Walk two miles and journal",
        description: "Move your body and notice the world around you.",
        instructions:
          "Walk two miles outdoors. Journal what you see, hear, and feel.",
        estimatedMinutes: 60,
        locationType: "OUTDOOR",
        difficulty: "MEDIUM",
        categoryPoints: { BODY: 2, CREATIVITY: 2, CHARACTER: 1 },
        proofType: "SHORT_REFLECTION",
        proofPrompt: "Share highlights from your walk journal.",
      },
      {
        key: "sun-library-fact",
        title: "Library local history fact",
        description: "Visit a library and discover your area's story.",
        instructions:
          "Visit a library with a parent. Find one local history fact and share it.",
        estimatedMinutes: 45,
        locationType: "COMMUNITY",
        difficulty: "EASY",
        categoryPoints: { RESPONSIBILITY: 1, COMMUNITY: 2, CREATIVITY: 1 },
        proofType: "SHORT_REFLECTION",
        proofPrompt: "What local history fact did you find?",
      },
      {
        key: "sun-elder-interview",
        title: "Elder summer memories",
        description: "Interview an elder about summer memories.",
        instructions:
          "Ask an elder about a summer memory from their youth. Write or record what they share.",
        estimatedMinutes: 40,
        locationType: "ANY",
        difficulty: "MEDIUM",
        categoryPoints: { CHARACTER: 2, COMMUNITY: 2, CREATIVITY: 1 },
        proofType: "SHORT_REFLECTION",
        proofPrompt: "What summer memory did they share?",
      },
      {
        key: "sun-outdoor-beauty",
        title: "Sketch or photograph beauty outside",
        description: "Capture something beautiful in the natural world.",
        instructions:
          "Find something beautiful outside. Sketch it or take a photograph and describe why you chose it.",
        estimatedMinutes: 35,
        locationType: "OUTDOOR",
        difficulty: "EASY",
        categoryPoints: { CREATIVITY: 3, BODY: 1 },
        proofType: "SHORT_REFLECTION",
        proofPrompt: "Share your image or describe your sketch.",
      },
      {
        key: "sun-family-activity",
        title: "Plan an outdoor family activity",
        description: "Help plan time together outside.",
        instructions:
          "Help your parent plan one outdoor family activity. Include location, time, and what each person will do.",
        estimatedMinutes: 30,
        locationType: "HOME",
        difficulty: "EASY",
        categoryPoints: { RESPONSIBILITY: 2, COMMUNITY: 2, CHARACTER: 1 },
        proofType: "SHORT_REFLECTION",
        proofPrompt: "What did you plan and when will it happen?",
      },
    ],
  },
  {
    slug: "city-explorer",
    milestoneNumber: 5,
    title: "Black Futures: Build the Code",
    description: "Design technology, community, and the world you want to lead.",
    cards: [
      {
        key: "city-landmark",
        title: "Visit a local landmark",
        description: "Explore a meaningful place in your city.",
        instructions:
          "Visit a landmark with a parent. Learn who it honors or what happened there.",
        estimatedMinutes: 50,
        locationType: "COMMUNITY",
        difficulty: "MEDIUM",
        categoryPoints: { COMMUNITY: 3, CHARACTER: 1 },
        proofType: "SHORT_REFLECTION",
        proofPrompt: "What landmark did you visit and what did you learn?",
      },
      {
        key: "city-neighborhood",
        title: "Neighborhood history walk",
        description: "Walk a neighborhood and notice its history.",
        instructions:
          "Take a parent-supervised walk. Note three signs of history or culture you see.",
        estimatedMinutes: 45,
        locationType: "OUTDOOR",
        difficulty: "MEDIUM",
        categoryPoints: { COMMUNITY: 2, BODY: 1, CREATIVITY: 1 },
        proofType: "SHORT_REFLECTION",
        proofPrompt: "What three things did you notice?",
      },
      {
        key: "city-story",
        title: "Share a city story",
        description: "Tell one story about Black history in your city.",
        instructions:
          "Research or interview someone about Black history in your city. Share one story in writing.",
        estimatedMinutes: 40,
        locationType: "ANY",
        difficulty: "CHALLENGING",
        categoryPoints: { CHARACTER: 2, COMMUNITY: 3 },
        proofType: "SHORT_REFLECTION",
        proofPrompt: "Summarize the city story you learned.",
      },
    ],
  },
];
