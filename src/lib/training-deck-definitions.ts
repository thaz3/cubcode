import type {
  FocusDeckDifficulty,
  FocusDeckLocationType,
  TaskProofType,
} from "@/generated/prisma/client";
import type { FocusDeckCategoryPoints } from "@/lib/focus-deck-categories";

export type TrainingDeckCardDefinition = {
  key: string;
  title: string;
  description: string;
  instructions: string;
  estimatedMinutes: number;
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

export const TRAINING_DECK_DEFINITIONS: TrainingDeckDefinition[] = [
  {
    slug: "start-your-code",
    milestoneNumber: 1,
    title: "Start Your Code",
    description:
      "Learn how C.U.B. Code works — focus, proof, and parent approval.",
    cards: [
      {
        key: "code-promise",
        title: "Read the Code promise",
        description: "Understand what earned freedom means in your home.",
        instructions:
          "Read the C.U.B. Code promise with your parent. Write one sentence about what you will earn and what you will protect.",
        estimatedMinutes: 15,
        locationType: "HOME",
        difficulty: "EASY",
        categoryPoints: { CHARACTER: 2, RESPONSIBILITY: 1 },
        proofType: "SHORT_REFLECTION",
        proofPrompt: "What does earned freedom mean to you?",
      },
      {
        key: "first-focus-block",
        title: "Complete your first focus block",
        description: "Practice staying in control for a short focus session.",
        instructions:
          "Complete one parent-approved focus block. Stay off distractions until your parent says time is up.",
        estimatedMinutes: 30,
        locationType: "HOME",
        difficulty: "EASY",
        categoryPoints: { BODY: 2, CHARACTER: 1 },
        proofType: "PARENT_APPROVAL",
        proofPrompt: "Parent confirms the focus block was completed.",
      },
      {
        key: "proof-practice",
        title: "Practice submitting proof",
        description: "Learn how assignments get reviewed and approved.",
        instructions:
          "Complete a small chore and submit a short reflection with parent help.",
        estimatedMinutes: 20,
        locationType: "HOME",
        difficulty: "EASY",
        categoryPoints: { RESPONSIBILITY: 2, CHARACTER: 1 },
        proofType: "SHORT_REFLECTION",
        proofPrompt: "What did you do and what did you learn about the review process?",
      },
    ],
  },
  {
    slug: "build-your-rhythm",
    milestoneNumber: 2,
    title: "Build Your Rhythm",
    description: "Build steady habits — sleep, study, and daily structure.",
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
    title: "Know Your Roots",
    description: "Black history awareness, family identity, and community pride.",
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
    title: "Get Some Sun",
    description:
      "Outdoor summer learning — parks, libraries, walks, and family history outside.",
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
    title: "City Explorer",
    description: "Black history in your city — landmarks, neighborhoods, and local stories.",
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
