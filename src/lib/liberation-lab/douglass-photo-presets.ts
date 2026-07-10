export type DouglassPhotoPreset = {
  id: string;
  title: string;
  era: string;
  mood: string;
  bestFor: string[];
  description: string;
  placeholderStyle: string;
  imageUrl?: string;
};

// TODO: Replace placeholder imageUrl values with approved Frederick Douglass portrait assets.
export const DOUGLASS_PHOTO_PRESETS: DouglassPhotoPreset[] = [
  {
    id: "young-douglass",
    title: "Young Douglass",
    era: "Early abolitionist years",
    mood: "Determined",
    bestFor: ["escape"],
    description:
      "A younger Douglass image choice for posts about self-liberation, courage, and becoming free.",
    placeholderStyle: "from-amber-700 via-orange-900 to-slate-900 border-amber-400/40",
  },
  {
    id: "stern-portrait",
    title: "Stern Portrait",
    era: "Public speaker era",
    mood: "Serious",
    bestFor: ["fourth-of-july", "call-to-arms"],
    description:
      "A serious portrait choice that shows Douglass refusing to look passive or harmless.",
    placeholderStyle: "from-slate-800 via-zinc-800 to-slate-950 border-slate-400/40",
  },
  {
    id: "formal-suit",
    title: "Formal Suit",
    era: "National leader era",
    mood: "Powerful",
    bestFor: ["fourth-of-july"],
    description:
      "A formal image choice that shows dignity, discipline, and public authority.",
    placeholderStyle: "from-indigo-900 via-slate-800 to-indigo-950 border-indigo-400/40",
  },
  {
    id: "direct-gaze",
    title: "Direct Gaze",
    era: "Portrait strategy",
    mood: "Unshaken",
    bestFor: ["escape", "call-to-arms"],
    description: "A direct eye-contact image choice that challenges the viewer.",
    placeholderStyle: "from-violet-900 via-purple-900 to-fuchsia-950 border-violet-400/40",
  },
  {
    id: "newspaper-editor",
    title: "The North Star Editor",
    era: "Newspaper era",
    mood: "Strategic",
    bestFor: ["fourth-of-july", "call-to-arms"],
    description:
      "An image choice connected to Douglass as a writer, editor, and public voice.",
    placeholderStyle: "from-stone-700 via-zinc-800 to-neutral-950 border-stone-400/40",
  },
  {
    id: "elder-statesman",
    title: "Elder Statesman",
    era: "Later leadership years",
    mood: "Commanding",
    bestFor: ["call-to-arms"],
    description:
      "A later Douglass image choice that shows leadership, wisdom, and authority.",
    placeholderStyle: "from-amber-900 via-red-950 to-slate-900 border-amber-500/40",
  },
];

export function getDouglassPhotoPreset(id: string | undefined | null): DouglassPhotoPreset | null {
  if (!id) return null;
  return DOUGLASS_PHOTO_PRESETS.find((preset) => preset.id === id) ?? null;
}

export function isPhotoRecommendedForPost(
  preset: DouglassPhotoPreset,
  postKey: string,
): boolean {
  return preset.bestFor.includes(postKey);
}
