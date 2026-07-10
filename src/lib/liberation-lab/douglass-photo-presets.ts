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

// Public-domain portraits from Wikimedia Commons.
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
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Frederick_Douglass_c1860s.jpg/440px-Frederick_Douglass_c1860s.jpg",
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
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Frederick_Douglass_-_Restored.png/440px-Frederick_Douglass_-_Restored.png",
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
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Frederick_Douglass_-_circa_1860s.jpg/440px-Frederick_Douglass_-_circa_1860s.jpg",
  },
  {
    id: "direct-gaze",
    title: "Direct Gaze",
    era: "Portrait strategy",
    mood: "Unshaken",
    bestFor: ["escape", "call-to-arms"],
    description: "A direct eye-contact image choice that challenges the viewer.",
    placeholderStyle: "from-violet-900 via-purple-900 to-fuchsia-950 border-violet-400/40",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Frederick_Douglass_by_Samuel_J._Miller%2C_1847-52.png/440px-Frederick_Douglass_by_Samuel_J._Miller%2C_1847-52.png",
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
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Frederick_Douglass_circa_1874.jpg/440px-Frederick_Douglass_circa_1874.jpg",
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
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Frederick_Douglass%2C_CDV_portrait%2C_circa_1870s.jpg/440px-Frederick_Douglass%2C_CDV_portrait%2C_circa_1870s.jpg",
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
