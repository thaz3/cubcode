import {
  DOUGLASS_QUOTE_CARDS,
  MAX_SELECTED_QUOTES,
  findQuoteCardIdForPhotoPreset,
  getDouglassQuoteCard,
} from "@/lib/liberation-lab/douglass-quote-cards";
import { getDouglassPhotoPreset, getProfileMottoForPhoto } from "@/lib/liberation-lab/douglass-photo-presets";

export const AVATAR_STYLE_OPTIONS = [
  "FD initials",
  "Stern portrait",
  "North Star",
  "Printing press",
  "Freedom flame",
] as const;

export type AvatarStyle = (typeof AVATAR_STYLE_OPTIONS)[number];

const LEGACY_AVATAR_TO_PHOTO: Record<AvatarStyle, string> = {
  "FD initials": "young-douglass",
  "Stern portrait": "stern-portrait",
  "North Star": "newspaper-editor",
  "Printing press": "newspaper-editor",
  "Freedom flame": "elder-statesman",
};

export type CustomPostStatus = "Needs modern translation" | "Drafted" | "Ready";

export type CustomPostDraft = {
  modernTranslation: string;
  socialCaption: string;
  hashtags: string;
  whyThisPostBelongs: string;
};

export type DouglassProfileLabDraft = {
  profileDisplayName: string;
  profileHandle: string;
  profileBio: string;
  profileAbout: string;
  avatarPhotoId: string;
  profileMotto: string;
  strategyPoints: string[];
  selectedQuoteIds: string[];
  customPosts: Record<string, CustomPostDraft>;
};

export const DEFAULT_STRATEGY_POINTS = [
  "Control the image",
  "Use powerful words",
  "Challenge the audience",
] as const;

export const DOUGLASS_PROFILE_DEFAULTS = {
  profileDisplayName: "Frederick Douglass",
  profileHandle: "frederickdouglass",
  profileBio: "Writer. Orator. Abolitionist. I own my image. I speak for freedom.",
  profileAbout:
    "Frederick Douglass was one of the most photographed people of the 1800s. He rarely smiled in portraits. He wore formal clothes, looked directly into the camera, and used his image to challenge racist stereotypes.",
  avatarPhotoId: "young-douglass",
  profileMotto: "I am becoming free.",
  strategyPoints: [...DEFAULT_STRATEGY_POINTS],
};

export const EMPTY_CUSTOM_POST: CustomPostDraft = {
  modernTranslation: "",
  socialCaption: "",
  hashtags: "",
  whyThisPostBelongs: "",
};

const LEGACY_POST_KEYS = [
  "post-1",
  "post-2",
  "post-3",
  "escape",
  "fourth-of-july",
  "call-to-arms",
] as const;

export function createEmptyDraft(): DouglassProfileLabDraft {
  return {
    ...DOUGLASS_PROFILE_DEFAULTS,
    selectedQuoteIds: [],
    customPosts: {},
  };
}

export function normalizeHandle(value: string): string {
  return value.trim().replace(/^@+/, "");
}

export function formatDouglassProfileHandle(handle: string): string {
  const cleaned = normalizeHandle(handle);
  return cleaned ? `@${cleaned}` : `@${DOUGLASS_PROFILE_DEFAULTS.profileHandle}`;
}

function normalizeStrategyPoints(raw: unknown): string[] {
  if (!Array.isArray(raw)) {
    return [...DEFAULT_STRATEGY_POINTS];
  }

  const points = raw
    .map((point) => String(point).trim())
    .filter(Boolean)
    .slice(0, 3);

  while (points.length < 3) {
    points.push(DEFAULT_STRATEGY_POINTS[points.length] ?? "");
  }

  return points;
}

function resolveAvatarPhotoId(raw: Record<string, unknown>): string {
  const avatarPhotoId = String(raw.avatarPhotoId ?? "");
  if (getDouglassPhotoPreset(avatarPhotoId)) {
    return avatarPhotoId;
  }

  const avatarStyle = String(raw.avatarStyle ?? "");
  if (AVATAR_STYLE_OPTIONS.includes(avatarStyle as AvatarStyle)) {
    return LEGACY_AVATAR_TO_PHOTO[avatarStyle as AvatarStyle];
  }

  return DOUGLASS_PROFILE_DEFAULTS.avatarPhotoId;
}

function parseCustomPostEntry(entry: Record<string, unknown>): CustomPostDraft {
  return {
    modernTranslation: String(
      entry.modernTranslation ??
        entry.modernCaption ??
        entry.strategyExplanation ??
        entry.explanation ??
        "",
    ),
    socialCaption: String(entry.socialCaption ?? ""),
    hashtags: String(entry.hashtags ?? entry.hashtag ?? ""),
    whyThisPostBelongs: String(entry.whyThisPostBelongs ?? ""),
  };
}

function migrateLegacyPosts(raw: Record<string, unknown>): {
  selectedQuoteIds: string[];
  customPosts: Record<string, CustomPostDraft>;
} {
  const selectedQuoteIds: string[] = [];
  const customPosts: Record<string, CustomPostDraft> = {};

  const postsRaw = raw.posts;
  if (!postsRaw || typeof postsRaw !== "object") {
    return { selectedQuoteIds, customPosts };
  }

  const source = postsRaw as Record<string, unknown>;

  for (const key of LEGACY_POST_KEYS) {
    if (selectedQuoteIds.length >= MAX_SELECTED_QUOTES) break;

    const postRaw = source[key];
    if (!postRaw || typeof postRaw !== "object") continue;

    const entry = postRaw as Record<string, unknown>;
    const photoId = String(entry.selectedPhotoId ?? "");
    const quoteCardId = photoId ? findQuoteCardIdForPhotoPreset(photoId) : null;

    if (!quoteCardId || selectedQuoteIds.includes(quoteCardId)) continue;

    selectedQuoteIds.push(quoteCardId);
    customPosts[quoteCardId] = parseCustomPostEntry(entry);
  }

  return { selectedQuoteIds, customPosts };
}

function parseCustomPostsRaw(raw: unknown): Record<string, CustomPostDraft> {
  if (!raw || typeof raw !== "object") return {};

  const result: Record<string, CustomPostDraft> = {};
  for (const [quoteId, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!getDouglassQuoteCard(quoteId) || !value || typeof value !== "object") continue;
    result[quoteId] = parseCustomPostEntry(value as Record<string, unknown>);
  }
  return result;
}

export function parseDouglassProfileDraft(raw: Record<string, unknown>): DouglassProfileLabDraft {
  const empty = createEmptyDraft();

  empty.profileDisplayName = String(
    raw.profileDisplayName ?? DOUGLASS_PROFILE_DEFAULTS.profileDisplayName,
  );
  empty.profileHandle = normalizeHandle(
    String(raw.profileHandle ?? DOUGLASS_PROFILE_DEFAULTS.profileHandle),
  );
  empty.profileBio = String(raw.profileBio ?? DOUGLASS_PROFILE_DEFAULTS.profileBio);
  empty.profileAbout = String(raw.profileAbout ?? DOUGLASS_PROFILE_DEFAULTS.profileAbout);
  empty.avatarPhotoId = resolveAvatarPhotoId(raw);
  empty.profileMotto = getProfileMottoForPhoto(empty.avatarPhotoId);
  empty.strategyPoints = normalizeStrategyPoints(raw.strategyPoints);

  if (Array.isArray(raw.selectedQuoteIds)) {
    empty.selectedQuoteIds = raw.selectedQuoteIds
      .map(String)
      .filter((id) => Boolean(getDouglassQuoteCard(id)))
      .slice(0, MAX_SELECTED_QUOTES);
  }

  empty.customPosts = parseCustomPostsRaw(raw.customPosts);

  if (empty.selectedQuoteIds.length === 0) {
    const migrated = migrateLegacyPosts(raw);
    empty.selectedQuoteIds = migrated.selectedQuoteIds;
    empty.customPosts = { ...migrated.customPosts, ...empty.customPosts };
  }

  return empty;
}

export function getCustomPostDraft(
  draft: DouglassProfileLabDraft,
  quoteCardId: string,
): CustomPostDraft {
  return draft.customPosts[quoteCardId] ?? { ...EMPTY_CUSTOM_POST };
}

export function getCustomPostStatus(post: CustomPostDraft): CustomPostStatus {
  const translation = post.modernTranslation.trim();
  const why = post.whyThisPostBelongs.trim();

  if (!translation) return "Needs modern translation";
  if (!why || why.length < 40) return "Drafted";
  return "Ready";
}

export function countReadyPosts(draft: DouglassProfileLabDraft): number {
  return draft.selectedQuoteIds.filter(
    (quoteId) => getCustomPostStatus(getCustomPostDraft(draft, quoteId)) === "Ready",
  ).length;
}

export function hasCustomPostContent(draft: DouglassProfileLabDraft, quoteCardId: string): boolean {
  return getCustomPostStatus(getCustomPostDraft(draft, quoteCardId)) !== "Needs modern translation";
}

export function isProfileSetupStarted(draft: DouglassProfileLabDraft): boolean {
  return (
    draft.profileDisplayName.trim().length > 0 &&
    normalizeHandle(draft.profileHandle).length > 0 &&
    draft.profileBio.trim().length > 0 &&
    draft.profileAbout.trim().length > 0 &&
    getProfileMottoForPhoto(draft.avatarPhotoId).length > 0
  );
}

export function selectAvatarPhoto(
  photoId: string,
): Pick<DouglassProfileLabDraft, "avatarPhotoId" | "profileMotto"> {
  return {
    avatarPhotoId: photoId,
    profileMotto: getProfileMottoForPhoto(photoId),
  };
}

export function toggleQuoteSelection(
  draft: DouglassProfileLabDraft,
  quoteCardId: string,
): { draft: DouglassProfileLabDraft; message: string | null } {
  const card = getDouglassQuoteCard(quoteCardId);
  if (!card) {
    return { draft, message: null };
  }

  const isSelected = draft.selectedQuoteIds.includes(quoteCardId);

  if (isSelected) {
    return {
      draft: {
        ...draft,
        selectedQuoteIds: draft.selectedQuoteIds.filter((id) => id !== quoteCardId),
      },
      message: null,
    };
  }

  if (draft.selectedQuoteIds.length >= MAX_SELECTED_QUOTES) {
    return {
      draft,
      message: "Choose only 3 quotes for this profile.",
    };
  }

  return {
    draft: {
      ...draft,
      selectedQuoteIds: [...draft.selectedQuoteIds, quoteCardId],
      customPosts: {
        ...draft.customPosts,
        [quoteCardId]: draft.customPosts[quoteCardId] ?? { ...EMPTY_CUSTOM_POST },
      },
    },
    message: null,
  };
}

export const GRID_SLOT_LABELS = ["Custom Post 1", "Custom Post 2", "Custom Post 3"] as const;

export function getQuoteCardsForDraft(draft: DouglassProfileLabDraft) {
  return draft.selectedQuoteIds
    .map((id) => getDouglassQuoteCard(id))
    .filter((card): card is NonNullable<typeof card> => card !== null);
}

export { DOUGLASS_QUOTE_CARDS, MAX_SELECTED_QUOTES };
