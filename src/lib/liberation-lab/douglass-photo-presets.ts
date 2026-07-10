export type DouglassPhotoPreset = {
  id: string;
  title: string;
  era: string;
  mood: string;
  profileMotto: string;
  postQuote: string;
  description: string;
  placeholderStyle: string;
  imageUrl?: string;
};

const DOUGLASS_PHOTO_BASE = "/liberation-lab/douglass";

// Portrait and legacy images from the project's Frederick Douglass collection.
export const DOUGLASS_PHOTO_PRESETS: DouglassPhotoPreset[] = [
  {
    id: "young-douglass",
    title: "Young Douglass",
    era: "Early abolitionist years",
    mood: "Determined",
    profileMotto: "I am becoming free.",
    postQuote:
      "I prayed for freedom for twenty years, but received no answer until I prayed with my legs.",
    description:
      "A younger Douglass image choice for posts about self-liberation, courage, and becoming free.",
    placeholderStyle: "from-amber-700 via-orange-900 to-slate-900 border-amber-400/40",
    imageUrl: `${DOUGLASS_PHOTO_BASE}/young-douglass.jpg`,
  },
  {
    id: "stern-portrait",
    title: "Stern Portrait",
    era: "Public speaker era",
    mood: "Serious",
    profileMotto: "I will not look harmless.",
    postQuote: "What, to the American slave, is your 4th of July?",
    description:
      "A serious portrait choice that shows Douglass refusing to look passive or harmless.",
    placeholderStyle: "from-slate-800 via-zinc-800 to-slate-950 border-slate-400/40",
    imageUrl: `${DOUGLASS_PHOTO_BASE}/stern-portrait.jpg`,
  },
  {
    id: "formal-suit",
    title: "Formal Suit",
    era: "National leader era",
    mood: "Powerful",
    profileMotto: "Dignity is my armor.",
    postQuote: "It is easier to build strong children than to repair broken men.",
    description:
      "A formal image choice that shows dignity, discipline, and public authority.",
    placeholderStyle: "from-indigo-900 via-slate-800 to-indigo-950 border-indigo-400/40",
    imageUrl: `${DOUGLASS_PHOTO_BASE}/formal-suit.jpg`,
  },
  {
    id: "direct-gaze",
    title: "Direct Gaze",
    era: "Portrait strategy",
    mood: "Unshaken",
    profileMotto: "Look me in the eye.",
    postQuote: "Power concedes nothing without a demand.",
    description: "A direct eye-contact image choice that challenges the viewer.",
    placeholderStyle: "from-violet-900 via-purple-900 to-fuchsia-950 border-violet-400/40",
    imageUrl: `${DOUGLASS_PHOTO_BASE}/direct-gaze.jpg`,
  },
  {
    id: "newspaper-editor",
    title: "The North Star Editor",
    era: "Newspaper era",
    mood: "Strategic",
    profileMotto: "My words are my weapon.",
    postQuote: "Once you learn to read, you will be forever free.",
    description:
      "An image choice connected to Douglass as a writer, editor, and public voice.",
    placeholderStyle: "from-stone-700 via-zinc-800 to-neutral-950 border-stone-400/40",
    imageUrl: `${DOUGLASS_PHOTO_BASE}/newspaper-editor.jpg`,
  },
  {
    id: "elder-statesman",
    title: "Elder Statesman",
    era: "Later leadership years",
    mood: "Commanding",
    profileMotto: "Lead with wisdom and truth.",
    postQuote: "Without struggle there is no progress.",
    description:
      "A later Douglass image choice that shows leadership, wisdom, and authority.",
    placeholderStyle: "from-amber-900 via-red-950 to-slate-900 border-amber-500/40",
    imageUrl: `${DOUGLASS_PHOTO_BASE}/elder-statesman.jpg`,
  },
  {
    id: "midcareer-portrait",
    title: "Mid-Career Portrait",
    era: "Abolitionist speaker",
    mood: "Focused",
    profileMotto: "I speak for freedom.",
    postQuote: "I would unite with anybody to do right and with nobody to do wrong.",
    description:
      "A mid-career portrait that shows Douglass stepping into public leadership.",
    placeholderStyle: "from-zinc-700 via-stone-800 to-zinc-950 border-zinc-400/40",
    imageUrl: `${DOUGLASS_PHOTO_BASE}/midcareer-portrait.jpg`,
  },
  {
    id: "engraved-leader",
    title: "Engraved Leader",
    era: "Public print era",
    mood: "Resolute",
    profileMotto: "My image tells my story.",
    postQuote:
      "Remember that in a contest with oppression, the man who strikes the first blow is a man.",
    description:
      "A bold engraved portrait style that shows how Douglass spread his image in print.",
    placeholderStyle: "from-neutral-800 via-zinc-900 to-black border-neutral-500/40",
    imageUrl: `${DOUGLASS_PHOTO_BASE}/engraved-leader.jpg`,
  },
  {
    id: "elder-portrait",
    title: "Elder Portrait",
    era: "Later years",
    mood: "Dignified",
    profileMotto: "I earned this respect.",
    postQuote: "The soul that is within me no man shall degrade.",
    description:
      "A close elder portrait that highlights Douglass's gravity and lived experience.",
    placeholderStyle: "from-stone-800 via-zinc-900 to-stone-950 border-stone-400/40",
    imageUrl: `${DOUGLASS_PHOTO_BASE}/elder-portrait.jpg`,
  },
  {
    id: "family-portrait",
    title: "Family at Cedar Hill",
    era: "Cedar Hill years",
    mood: "Grounded",
    profileMotto: "Freedom is worth building a life for.",
    postQuote: "A man's character always takes its hue from those who are about him.",
    description:
      "A family portrait choice that shows Douglass building life, home, and legacy.",
    placeholderStyle: "from-amber-900 via-stone-800 to-amber-950 border-amber-400/40",
    imageUrl: `${DOUGLASS_PHOTO_BASE}/family-portrait.jpg`,
  },
  {
    id: "with-grandson",
    title: "With Grandson",
    era: "Family legacy",
    mood: "Proud",
    profileMotto: "We pass the fight forward.",
    postQuote: "It is not light that we need, but fire; it is not the gentle shower, but thunder.",
    description:
      "An image choice about passing leadership and hope to the next generation.",
    placeholderStyle: "from-amber-800 via-orange-950 to-stone-900 border-orange-400/40",
    imageUrl: `${DOUGLASS_PHOTO_BASE}/with-grandson.jpg`,
  },
  {
    id: "memorial-stone",
    title: "Memorial Stone",
    era: "Legacy",
    mood: "Remembered",
    profileMotto: "Remember what we fought for.",
    postQuote:
      "The life of the nation is secure only while the nation is honest, truthful, and virtuous.",
    description:
      "A memorial image choice about how communities remember Douglass's life and work.",
    placeholderStyle: "from-slate-700 via-stone-800 to-slate-950 border-slate-400/40",
    imageUrl: `${DOUGLASS_PHOTO_BASE}/memorial-stone.jpg`,
  },
  {
    id: "cedar-hill-home",
    title: "Cedar Hill Home",
    era: "Home and refuge",
    mood: "Rooted",
    profileMotto: "Freedom needs a home.",
    postQuote: "I bought my own freedom with the earnings of my hands.",
    description:
      "A home image choice connected to freedom, stability, and building a life after escape.",
    placeholderStyle: "from-emerald-900 via-stone-800 to-emerald-950 border-emerald-400/40",
    imageUrl: `${DOUGLASS_PHOTO_BASE}/cedar-hill-home.jpg`,
  },
];

export function getDouglassPhotoPreset(id: string | undefined | null): DouglassPhotoPreset | null {
  if (!id) return null;
  return DOUGLASS_PHOTO_PRESETS.find((preset) => preset.id === id) ?? null;
}

export function getProfileMottoForPhoto(id: string | undefined | null): string {
  return getDouglassPhotoPreset(id)?.profileMotto ?? "";
}

export function getPostQuoteForPhoto(id: string | undefined | null): string {
  return getDouglassPhotoPreset(id)?.postQuote ?? "";
}
