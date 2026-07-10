import { getDouglassPhotoPreset } from "@/lib/liberation-lab/douglass-photo-presets";

// TODO: Replace or verify quote/photo bank with approved Frederick Douglass source materials before production.

export type DouglassQuoteCard = {
  id: string;
  title: string;
  quote: string;
  theme: string;
  mood: string;
  context: string;
  photoPresetId: string;
};

export const MAX_SELECTED_QUOTES = 3;

export const DOUGLASS_QUOTE_CARDS: DouglassQuoteCard[] = [
  {
    id: "literacy-power",
    title: "Words Are Power",
    quote: "Once you learn to read, you will be forever free.",
    theme: "Literacy",
    mood: "Awakening",
    context: "Douglass understood reading as a path to power, truth, and freedom.",
    photoPresetId: "newspaper-editor",
  },
  {
    id: "freedom-action",
    title: "Freedom Takes Action",
    quote:
      "I prayed for freedom for twenty years, but received no answer until I prayed with my legs.",
    theme: "Action",
    mood: "Determined",
    context: "This quote connects freedom to movement, courage, and self-liberation.",
    photoPresetId: "young-douglass",
  },
  {
    id: "fourth-question",
    title: "A Question for America",
    quote: "What, to the American slave, is your 4th of July?",
    theme: "Truth-telling",
    mood: "Challenging",
    context: "Douglass used public speech to challenge American hypocrisy.",
    photoPresetId: "stern-portrait",
  },
  {
    id: "struggle-progress",
    title: "No Struggle, No Progress",
    quote: "If there is no struggle, there is no progress.",
    theme: "Resistance",
    mood: "Bold",
    context: "Douglass reminds us that change requires pressure, courage, and persistence.",
    photoPresetId: "elder-statesman",
  },
  {
    id: "power-concedes",
    title: "Power Concedes Nothing",
    quote: "Power concedes nothing without a demand.",
    theme: "Justice",
    mood: "Commanding",
    context: "Douglass argued that justice must be demanded, not politely waited for.",
    photoPresetId: "direct-gaze",
  },
  {
    id: "own-story",
    title: "Own Your Story",
    quote:
      "You have seen how a man was made a slave; you shall see how a slave was made a man.",
    theme: "Identity",
    mood: "Defiant",
    context: "Douglass used his own story to reclaim his humanity and expose slavery.",
    photoPresetId: "engraved-leader",
  },
  {
    id: "knowledge-freedom",
    title: "Knowledge Opens Doors",
    quote: "Knowledge makes a man unfit to be a slave.",
    theme: "Knowledge",
    mood: "Focused",
    context: "Douglass saw education as a direct threat to slavery.",
    photoPresetId: "formal-suit",
  },
  {
    id: "voice-freedom",
    title: "Speak for Freedom",
    quote: "I would unite with anybody to do right and with nobody to do wrong.",
    theme: "Moral courage",
    mood: "Principled",
    context: "Douglass built alliances but stayed rooted in justice.",
    photoPresetId: "midcareer-portrait",
  },
];

export function getDouglassQuoteCard(id: string | undefined | null): DouglassQuoteCard | null {
  if (!id) return null;
  return DOUGLASS_QUOTE_CARDS.find((card) => card.id === id) ?? null;
}

export function findQuoteCardIdForPhotoPreset(photoPresetId: string): string | null {
  const card = DOUGLASS_QUOTE_CARDS.find((entry) => entry.photoPresetId === photoPresetId);
  return card?.id ?? null;
}

export function getQuoteCardPhotoPreset(card: DouglassQuoteCard) {
  return getDouglassPhotoPreset(card.photoPresetId);
}
