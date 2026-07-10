"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DOUGLASS_PHOTO_PRESETS,
  getDouglassPhotoPreset,
  isPhotoRecommendedForPost,
  type DouglassPhotoPreset,
} from "@/lib/liberation-lab/douglass-photo-presets";
import { cn } from "@/lib/utils";

export const IMAGE_STRATEGY_OPTIONS = [
  "Stern portrait",
  "Formal suit",
  "Direct eye contact",
  "Public speaker",
  "Abolitionist newspaper style",
] as const;

export type ImageStrategy = (typeof IMAGE_STRATEGY_OPTIONS)[number];

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

export type DouglassProfileLabDraft = {
  profileDisplayName: string;
  profileHandle: string;
  profileBio: string;
  avatarPhotoId: string;
  profileMotto: string;
  strategyPoints: string[];
  posts: Record<DouglassProfilePostKey, DouglassProfilePostDraft>;
};

export const DOUGLASS_PROFILE_POSTS = [
  {
    postKey: "escape",
    title: "The Escape",
    requiredQuote:
      "I prayed for freedom for twenty years, but received no answer until I prayed with my legs.",
    prompt: "What does this quote show about action, courage, and freedom?",
  },
  {
    postKey: "fourth-of-july",
    title: "The Fourth of July Speech",
    requiredQuote: "What, to the American slave, is your 4th of July?",
    prompt: "Why would Douglass use this question as a public challenge to America?",
  },
  {
    postKey: "call-to-arms",
    title: "The Call to Arms",
    requiredQuote:
      "Remember that in a contest with oppression, the man who strikes the first blow is a man.",
    prompt: "What message is Douglass sending about resistance and self-respect?",
  },
] as const;

export type DouglassProfilePostKey = (typeof DOUGLASS_PROFILE_POSTS)[number]["postKey"];

export type PostStatus = "Empty" | "Drafted" | "Ready";

export type DouglassProfilePostDraft = {
  selectedPhotoId: string;
  selectedStrategy: ImageStrategy | "";
  strategyExplanation: string;
  modernCaption: string;
};

type ProfileTab = "profile" | "grid" | "about" | "strategy";

export const DEFAULT_STRATEGY_POINTS = [
  "Control the image",
  "Use powerful words",
  "Challenge the audience",
] as const;

export const STRATEGY_BULLETS = DEFAULT_STRATEGY_POINTS;

export const DOUGLASS_PROFILE_DEFAULTS = {
  profileDisplayName: "Frederick Douglass",
  profileHandle: "frederickdouglass",
  profileBio: "Writer. Orator. Abolitionist. I own my image. I speak for freedom.",
  avatarPhotoId: "young-douglass",
  profileMotto: "",
  strategyPoints: [...DEFAULT_STRATEGY_POINTS],
};

const SUGGESTED_HANDLES = [
  "freedomreader",
  "douglassspeaks",
  "northstarvoice",
  "wordsforfreedom",
  "defiantportrait",
] as const;

const SUGGESTED_BIOS = [
  "I use words to fight for freedom.",
  "Abolitionist. Speaker. Editor. Free man.",
  "My story belongs to me.",
  "Reading gave me power. Speaking gave me purpose.",
] as const;

const EMPTY_POST: DouglassProfilePostDraft = {
  selectedPhotoId: "",
  selectedStrategy: "",
  strategyExplanation: "",
  modernCaption: "",
};

const PROFILE_TABS: { id: ProfileTab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "grid", label: "Grid" },
  { id: "about", label: "About" },
  { id: "strategy", label: "Strategy" },
];

const STATUS_STYLES: Record<PostStatus, string> = {
  Empty: "bg-zinc-500/90 text-white",
  Drafted: "bg-amber-500/90 text-amber-950",
  Ready: "bg-emerald-500/90 text-emerald-950",
};

function createEmptyDraft(): DouglassProfileLabDraft {
  return {
    ...DOUGLASS_PROFILE_DEFAULTS,
    posts: {
      escape: { ...EMPTY_POST },
      "fourth-of-july": { ...EMPTY_POST },
      "call-to-arms": { ...EMPTY_POST },
    },
  };
}

function normalizeHandle(value: string): string {
  return value.trim().replace(/^@+/, "");
}

export function formatDouglassProfileHandle(handle: string): string {
  const cleaned = normalizeHandle(handle);
  return cleaned ? `@${cleaned}` : `@${DOUGLASS_PROFILE_DEFAULTS.profileHandle}`;
}

function getDisplayInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "FD";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
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

export function parseDouglassProfileDraft(raw: Record<string, unknown>): DouglassProfileLabDraft {
  const empty = createEmptyDraft();

  empty.profileDisplayName = String(
    raw.profileDisplayName ?? DOUGLASS_PROFILE_DEFAULTS.profileDisplayName,
  );
  empty.profileHandle = normalizeHandle(
    String(raw.profileHandle ?? DOUGLASS_PROFILE_DEFAULTS.profileHandle),
  );
  empty.profileBio = String(raw.profileBio ?? DOUGLASS_PROFILE_DEFAULTS.profileBio);
  empty.profileMotto = String(raw.profileMotto ?? "");
  empty.avatarPhotoId = resolveAvatarPhotoId(raw);
  empty.strategyPoints = normalizeStrategyPoints(raw.strategyPoints);

  const postsRaw = raw.posts;
  if (postsRaw && typeof postsRaw === "object") {
    for (const post of DOUGLASS_PROFILE_POSTS) {
      const postRaw = (postsRaw as Record<string, unknown>)[post.postKey];
      if (!postRaw || typeof postRaw !== "object") continue;

      const entry = postRaw as Record<string, unknown>;
      const strategy = String(entry.selectedStrategy ?? entry.imageStrategy ?? "");
      const selectedPhotoId = String(entry.selectedPhotoId ?? "");

      empty.posts[post.postKey] = {
        selectedPhotoId: getDouglassPhotoPreset(selectedPhotoId) ? selectedPhotoId : "",
        selectedStrategy: IMAGE_STRATEGY_OPTIONS.includes(strategy as ImageStrategy)
          ? (strategy as ImageStrategy)
          : "",
        strategyExplanation: String(entry.strategyExplanation ?? entry.explanation ?? ""),
        modernCaption: String(entry.modernCaption ?? ""),
      };
    }
  }

  return empty;
}

export function getPostStatus(post: DouglassProfilePostDraft): PostStatus {
  const text = post.strategyExplanation.trim();
  if (!text) return "Empty";
  if (text.length < 40) return "Drafted";
  return "Ready";
}

function countReadyPosts(draft: DouglassProfileLabDraft): number {
  return DOUGLASS_PROFILE_POSTS.filter(
    (post) => getPostStatus(draft.posts[post.postKey]) === "Ready",
  ).length;
}

function hasDraftContent(post: DouglassProfilePostDraft): boolean {
  return getPostStatus(post) !== "Empty";
}

function isProfileSetupStarted(draft: DouglassProfileLabDraft): boolean {
  return (
    draft.profileDisplayName.trim().length > 0 &&
    normalizeHandle(draft.profileHandle).length > 0 &&
    draft.profileBio.trim().length > 0
  );
}

export function DouglassPresetPhotoVisual({
  preset,
  emptyLabel = "Choose image",
  className,
}: {
  preset: DouglassPhotoPreset | null;
  emptyLabel?: string;
  className?: string;
}) {
  if (!preset) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-zinc-200 via-zinc-100 to-zinc-200 p-3 text-center",
          className,
        )}
      >
        <p className="text-xs font-bold text-zinc-500">{emptyLabel}</p>
      </div>
    );
  }

  if (preset.imageUrl) {
    return (
      <div className={cn("relative overflow-hidden bg-zinc-200", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={preset.imageUrl}
          alt={`${preset.title} Frederick Douglass portrait`}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center border-2 bg-gradient-to-br p-3 text-center",
        preset.placeholderStyle,
        className,
      )}
    >
      <span className="text-2xl font-black text-white/90">FD</span>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-white/75">
        Portrait placeholder
      </p>
      <p className="mt-1 text-xs font-bold text-white/90">{preset.title}</p>
    </div>
  );
}

type DouglassPhotoPickerProps = {
  postKey: DouglassProfilePostKey;
  selectedPhotoId: string;
  onSelect: (photoId: string) => void;
};

function DouglassPhotoPicker({ postKey, selectedPhotoId, onSelect }: DouglassPhotoPickerProps) {
  return (
    <div className="rounded-2xl border-2 border-violet-200/80 bg-white/90 p-4">
      <Label className="text-kid-ink">Choose a Douglass image</Label>
      <p className="mt-1 text-xs text-kid-ink-muted">
        Pick the portrait that matches the mood and message of this post.
      </p>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {DOUGLASS_PHOTO_PRESETS.map((preset) => {
          const selected = selectedPhotoId === preset.id;
          const recommended = isPhotoRecommendedForPost(preset, postKey);

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect(preset.id)}
              className={cn(
                "touch-manipulation overflow-hidden rounded-2xl border-2 bg-white text-left transition",
                selected
                  ? "border-kid-purple ring-2 ring-kid-purple/40 shadow-md"
                  : "border-zinc-200 hover:border-kid-purple/40",
              )}
            >
              <DouglassPresetPhotoVisual preset={preset} className="aspect-[4/5] w-full rounded-none border-0" />
              <div className="space-y-2 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-black text-kid-ink">{preset.title}</p>
                  {selected ? (
                    <span className="rounded-full bg-kid-purple px-2 py-0.5 text-[10px] font-black uppercase text-white">
                      Selected ✓
                    </span>
                  ) : null}
                  {recommended ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase text-amber-900">
                      Recommended
                    </span>
                  ) : null}
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-kid-ink-muted">
                  {preset.era}
                </p>
                <span className="inline-block rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-800">
                  {preset.mood}
                </span>
                <p className="text-xs leading-relaxed text-kid-ink-muted">{preset.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DouglassProfileAvatar({
  avatarPhotoId,
  displayName,
  size = "md",
}: {
  avatarPhotoId: string;
  displayName: string;
  size?: "sm" | "md";
}) {
  const sizeClass = size === "sm" ? "h-10 w-10 text-sm" : "h-16 w-16 text-lg";
  const preset = getDouglassPhotoPreset(avatarPhotoId) ?? getDouglassPhotoPreset("young-douglass");
  const initials = getDisplayInitials(displayName);

  if (preset?.imageUrl) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full border-2 border-amber-300/50 shadow-md",
          sizeClass,
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={preset.imageUrl}
          alt={`${preset.title} portrait`}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border-2 border-amber-300/50 bg-gradient-to-br from-amber-700 via-amber-800 to-slate-900 shadow-md",
        sizeClass,
      )}
      aria-hidden
    >
      <span className="font-black text-amber-100">{initials || "FD"}</span>
    </div>
  );
}

function ProfileHeaderPreview({ draft }: { draft: DouglassProfileLabDraft }) {
  const displayName = draft.profileDisplayName.trim() || DOUGLASS_PROFILE_DEFAULTS.profileDisplayName;
  const handle = formatDouglassProfileHandle(draft.profileHandle);
  const bio = draft.profileBio.trim() || DOUGLASS_PROFILE_DEFAULTS.profileBio;

  return (
    <div className="px-4 py-5">
      <div className="flex items-start gap-4">
        <DouglassProfileAvatar
          avatarPhotoId={draft.avatarPhotoId}
          displayName={displayName}
        />
        <div className="min-w-0 flex-1">
          <p className="text-xl font-black text-white">{displayName}</p>
          <p className="text-sm font-semibold text-violet-200">{handle}</p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-200">{bio}</p>
          {draft.profileMotto.trim() ? (
            <p className="mt-2 text-xs font-bold italic text-amber-200/90">
              &ldquo;{draft.profileMotto.trim()}&rdquo;
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {["160+ portraits", "3 featured posts", "Freedom voice"].map((chip) => (
          <span
            key={chip}
            className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-zinc-100"
          >
            {chip}
          </span>
        ))}
      </div>

      <p className="mt-4 text-sm leading-relaxed text-violet-100/90">
        Build a profile that shows how Douglass used image, words, and public presence to
        control his own story.
      </p>
    </div>
  );
}

type ProfileSetupPanelProps = {
  draft: DouglassProfileLabDraft;
  onChange: (patch: Partial<DouglassProfileLabDraft>) => void;
  onSaveSetup: () => void;
  setupMessage: string | null;
};

function ProfileSetupPanel({
  draft,
  onChange,
  onSaveSetup,
  setupMessage,
}: ProfileSetupPanelProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-kid-purple/25 bg-white/90 px-4 py-3 shadow-sm">
        <p className="text-sm font-black text-kid-ink">Step 1: Set up the profile</p>
        <p className="mt-1 text-xs text-kid-ink-muted">
          Customize how Frederick Douglass appears on this mock profile. Step 2 is building
          your 3 posts in the Grid tab.
        </p>
      </div>

      <div className="rounded-2xl border-2 border-kid-purple/20 bg-white/95 p-4 shadow-sm">
        <Label htmlFor="profileDisplayName" className="text-kid-ink">
          Display name
        </Label>
        <Input
          id="profileDisplayName"
          value={draft.profileDisplayName}
          onChange={(event) => onChange({ profileDisplayName: event.target.value })}
          placeholder="Frederick Douglass"
          className="mt-2 border-zinc-300 bg-white text-kid-ink"
        />
      </div>

      <div className="rounded-2xl border-2 border-kid-purple/20 bg-white/95 p-4 shadow-sm">
        <Label htmlFor="profileHandle" className="text-kid-ink">
          Username / handle
        </Label>
        <Input
          id="profileHandle"
          value={draft.profileHandle}
          onChange={(event) => onChange({ profileHandle: normalizeHandle(event.target.value) })}
          placeholder="frederickdouglass"
          className="mt-2 border-zinc-300 bg-white text-kid-ink"
        />
        <p className="mt-2 text-xs text-kid-ink-muted">
          Preview: {formatDouglassProfileHandle(draft.profileHandle)}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTED_HANDLES.map((handle) => (
            <button
              key={handle}
              type="button"
              onClick={() => onChange({ profileHandle: handle })}
              className="min-h-9 touch-manipulation rounded-full border-2 border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-800 transition hover:border-kid-purple hover:bg-violet-100"
            >
              @{handle}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border-2 border-kid-purple/20 bg-white/95 p-4 shadow-sm">
        <Label htmlFor="profileBio" className="text-kid-ink">
          Bio
        </Label>
        <p className="mt-1 text-xs text-kid-ink-muted">
          Write a short bio that shows who Douglass was and what he stood for.
        </p>
        <textarea
          id="profileBio"
          value={draft.profileBio}
          onChange={(event) => onChange({ profileBio: event.target.value })}
          rows={3}
          placeholder={DOUGLASS_PROFILE_DEFAULTS.profileBio}
          className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base text-kid-ink outline-none ring-kid-purple/30 placeholder:text-zinc-400 focus:ring-2"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTED_BIOS.map((bio) => (
            <button
              key={bio}
              type="button"
              onClick={() => onChange({ profileBio: bio })}
              className="min-h-9 touch-manipulation rounded-xl border-2 border-amber-200 bg-amber-50 px-3 py-1.5 text-left text-xs font-semibold text-kid-ink transition hover:border-amber-400 hover:bg-amber-100"
            >
              {bio}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border-2 border-kid-purple/20 bg-white/95 p-4 shadow-sm">
        <Label className="font-bold text-kid-ink">Choose your avatar</Label>
        <p className="mt-1 text-xs text-kid-ink-muted">
          Pick a Frederick Douglass portrait for your profile picture.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {DOUGLASS_PHOTO_PRESETS.map((preset) => {
            const selected = draft.avatarPhotoId === preset.id;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onChange({ avatarPhotoId: preset.id })}
                className={cn(
                  "touch-manipulation overflow-hidden rounded-2xl border-2 text-left transition",
                  selected
                    ? "border-kid-purple ring-2 ring-kid-purple/30"
                    : "border-zinc-200 hover:border-kid-purple/40",
                )}
              >
                <DouglassPresetPhotoVisual
                  preset={preset}
                  className="aspect-square w-full rounded-none border-0"
                />
                <p className="px-2 py-2 text-xs font-bold text-kid-ink">{preset.title}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border-2 border-kid-purple/20 bg-white/95 p-4 shadow-sm">
        <Label htmlFor="profileMotto" className="text-kid-ink">
          Profile motto{" "}
          <span className="font-normal text-kid-ink-muted">(optional)</span>
        </Label>
        <p className="mt-1 text-xs text-kid-ink-muted">
          What is the message of this profile?
        </p>
        <Input
          id="profileMotto"
          value={draft.profileMotto}
          onChange={(event) => onChange({ profileMotto: event.target.value })}
          placeholder="Freedom through words"
          className="mt-2 border-zinc-300 bg-white text-kid-ink"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {["Freedom through words", "I own my story", "Truth is power"].map((motto) => (
            <button
              key={motto}
              type="button"
              onClick={() => onChange({ profileMotto: motto })}
              className="min-h-9 touch-manipulation rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-kid-ink-muted hover:border-kid-purple/40"
            >
              {motto}
            </button>
          ))}
        </div>
      </div>

      <Button type="button" variant="reward" fullWidth className="font-bold" onClick={onSaveSetup}>
        Save Profile Setup
      </Button>

      {setupMessage ? (
        <p
          className={cn(
            "text-sm",
            setupMessage.includes("Could not") ? "text-red-600" : "text-emerald-700",
          )}
        >
          {setupMessage}
        </p>
      ) : null}
    </div>
  );
}

type PostEditorModalProps = {
  post: (typeof DOUGLASS_PROFILE_POSTS)[number];
  draft: DouglassProfilePostDraft;
  onSave: (patch: DouglassProfilePostDraft) => void;
  onClose: () => void;
};

function PostEditorModal({ post, draft, onSave, onClose }: PostEditorModalProps) {
  const titleId = useId();
  const [editorDraft, setEditorDraft] = useState<DouglassProfilePostDraft>(draft);
  const selectedPreset = getDouglassPhotoPreset(editorDraft.selectedPhotoId);

  useEffect(() => {
    setEditorDraft(draft);
  }, [draft]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  function handleSave() {
    onSave(editorDraft);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close editor"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border-2 border-kid-purple/30 bg-gradient-to-br from-violet-50 via-white to-kid-cream shadow-2xl sm:rounded-3xl"
      >
        <div className="overflow-y-auto px-4 py-5 sm:px-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600">
                Edit post
              </p>
              <h3 id={titleId} className="mt-1 text-lg font-black text-kid-ink">
                {post.title}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 min-w-11 rounded-full border border-zinc-300 bg-white text-lg font-bold text-kid-ink-muted"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <blockquote className="mt-4 rounded-xl border border-violet-200/80 bg-white/90 px-3 py-2.5">
            <p className="text-sm font-semibold italic leading-relaxed text-kid-ink">
              &ldquo;{post.requiredQuote}&rdquo;
            </p>
            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-kid-ink-muted">
              Required caption
            </p>
          </blockquote>

          <p className="mt-3 text-sm font-medium text-kid-ink">{post.prompt}</p>

          <div className="mt-4">
            <DouglassPhotoPicker
              postKey={post.postKey}
              selectedPhotoId={editorDraft.selectedPhotoId}
              onSelect={(photoId) =>
                setEditorDraft((current) => ({ ...current, selectedPhotoId: photoId }))
              }
            />
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border-2 border-kid-purple/20">
            <DouglassPresetPhotoVisual
              preset={selectedPreset}
              emptyLabel="Choose image"
              className="aspect-[4/3] w-full"
            />
            {selectedPreset ? (
              <p className="bg-zinc-50 px-3 py-2 text-center text-xs font-semibold text-kid-ink-muted">
                {selectedPreset.title} · {selectedPreset.mood}
              </p>
            ) : (
              <p className="bg-zinc-50 px-3 py-2 text-center text-xs text-kid-ink-muted">
                Pick a portrait above to preview it here.
              </p>
            )}
          </div>

          <div className="mt-4">
            <Label className="text-kid-ink">Why this image works</Label>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {IMAGE_STRATEGY_OPTIONS.map((option) => {
                const selected = editorDraft.selectedStrategy === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      setEditorDraft((current) => ({ ...current, selectedStrategy: option }))
                    }
                    className={cn(
                      "min-h-11 touch-manipulation rounded-xl border-2 px-3 py-2.5 text-left text-sm font-bold transition",
                      selected
                        ? "border-kid-purple bg-kid-purple text-white shadow-md"
                        : "border-zinc-300 bg-white text-kid-ink hover:border-kid-purple/50",
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4">
            <Label htmlFor="strategyExplanation" className="text-kid-ink">
              Explain the strategy behind this post.
            </Label>
            <textarea
              id="strategyExplanation"
              value={editorDraft.strategyExplanation}
              onChange={(event) =>
                setEditorDraft((current) => ({
                  ...current,
                  strategyExplanation: event.target.value,
                }))
              }
              rows={4}
              placeholder="How does this image and caption help Douglass control his story?"
              className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base text-kid-ink outline-none ring-kid-purple/30 placeholder:text-zinc-400 focus:ring-2"
            />
            <p className="mt-1 text-xs text-kid-ink-muted">
              Write at least 40 characters to mark this post as Ready.
            </p>
          </div>

          <div className="mt-4">
            <Label htmlFor="modernCaption" className="text-kid-ink">
              Add a modern caption or hashtag.{" "}
              <span className="font-normal text-kid-ink-muted">(optional)</span>
            </Label>
            <textarea
              id="modernCaption"
              value={editorDraft.modernCaption}
              onChange={(event) =>
                setEditorDraft((current) => ({ ...current, modernCaption: event.target.value }))
              }
              rows={2}
              placeholder="#FreedomVoice #OwnYourStory"
              className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base text-kid-ink outline-none ring-kid-purple/30 placeholder:text-zinc-400 focus:ring-2"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-violet-200/80 bg-white/80 px-4 py-4 sm:flex-row">
          <Button type="button" variant="reward" fullWidth className="font-bold" onClick={handleSave}>
            Save Post
          </Button>
          <Button type="button" variant="neutral" fullWidth onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

type DouglassProfileLabProps = {
  storageKey: string;
  profileViewHref?: string;
};

function ViewProfilePageCallout({ profileViewHref }: { profileViewHref: string }) {
  return (
    <div className="rounded-2xl border-2 border-kid-purple/30 bg-gradient-to-r from-violet-50 via-white to-amber-50 px-4 py-3 shadow-sm">
      <p className="text-sm font-black text-kid-ink">See your profile as a page</p>
      <p className="mt-1 text-xs text-kid-ink-muted">
        Save your work, then open your full profile page to preview how it looks to the public.
      </p>
      <Link href={profileViewHref} className="mt-3 block">
        <Button
          type="button"
          fullWidth
          className="border-2 border-kid-purple bg-kid-purple font-bold text-white hover:bg-violet-700"
        >
          View Profile Page →
        </Button>
      </Link>
    </div>
  );
}

export function DouglassProfileLab({ storageKey, profileViewHref }: DouglassProfileLabProps) {
  const [draft, setDraft] = useState<DouglassProfileLabDraft>(createEmptyDraft);
  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");
  const [editingPostKey, setEditingPostKey] = useState<DouglassProfilePostKey | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [setupMessage, setSetupMessage] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        setDraft(parseDouglassProfileDraft(JSON.parse(raw) as Record<string, unknown>));
      }
    } catch {
      setDraft(createEmptyDraft());
    } finally {
      setHydrated(true);
    }
  }, [storageKey]);

  const readyCount = useMemo(() => countReadyPosts(draft), [draft]);
  const profileStarted = useMemo(() => isProfileSetupStarted(draft), [draft]);

  const editingPost = useMemo(
    () => DOUGLASS_PROFILE_POSTS.find((post) => post.postKey === editingPostKey) ?? null,
    [editingPostKey],
  );

  const draftedFeedPosts = useMemo(
    () =>
      DOUGLASS_PROFILE_POSTS.filter((post) => hasDraftContent(draft.posts[post.postKey])),
    [draft],
  );

  const updateDraft = useCallback((patch: Partial<DouglassProfileLabDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setSaveMessage(null);
    setSetupMessage(null);
  }, []);

  const updatePost = useCallback(
    (postKey: DouglassProfilePostKey, patch: DouglassProfilePostDraft) => {
      setDraft((current) => ({
        ...current,
        posts: {
          ...current.posts,
          [postKey]: patch,
        },
      }));
      setSaveMessage(null);
      setSetupMessage(null);
    },
    [],
  );

  function persistDraft(nextDraft: DouglassProfileLabDraft) {
    localStorage.setItem(storageKey, JSON.stringify(nextDraft));
  }

  function handleSaveProfileSetup() {
    try {
      persistDraft(draft);
      setSetupMessage("Profile setup saved. Now build your posts.");
      setSaveMessage(null);
    } catch {
      setSetupMessage("Could not save your profile setup. Try again.");
    }
  }

  function handleSaveProfile() {
    try {
      persistDraft(draft);
      setSaveMessage(
        "Profile saved. Return to your assignment when you are ready to submit your reflection.",
      );
      setSetupMessage(null);
    } catch {
      setSaveMessage("Could not save your draft. Try again.");
    }
  }

  function handleClear() {
    localStorage.removeItem(storageKey);
    setDraft(createEmptyDraft());
    setEditingPostKey(null);
    setActiveTab("profile");
    setSaveMessage("Draft cleared.");
    setSetupMessage(null);
  }

  if (!hydrated) {
    return <p className="text-sm text-kid-ink-muted">Loading profile lab…</p>;
  }

  return (
    <div className="space-y-5">
      {profileViewHref ? (
        <ViewProfilePageCallout profileViewHref={profileViewHref} />
      ) : null}

      <div className="overflow-hidden rounded-2xl border-2 border-kid-purple/25 bg-gradient-to-br from-slate-900 via-violet-950 to-indigo-950 shadow-md">
        <ProfileHeaderPreview draft={draft} />

        <div className="grid grid-cols-4 border-t border-white/10">
          {PROFILE_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "min-h-11 touch-manipulation py-3 text-xs font-bold transition sm:text-sm",
                activeTab === tab.id
                  ? "border-t-2 border-amber-300 bg-white/10 text-white"
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border-2 border-amber-300/40 bg-gradient-to-r from-amber-50 via-white to-violet-50 px-4 py-3 shadow-sm">
        <p className="text-sm font-black text-kid-ink">
          Step 1: Set up the profile · Step 2: Build the posts
        </p>
        <p className="mt-1 text-xs text-kid-ink-muted">
          {profileStarted
            ? "Profile identity ready — switch to Grid to build your 3 featured posts."
            : "Start on the Profile tab to choose your name, handle, bio, and avatar."}
        </p>
      </div>

      {activeTab === "profile" ? (
        <ProfileSetupPanel
          draft={draft}
          onChange={updateDraft}
          onSaveSetup={handleSaveProfileSetup}
          setupMessage={setupMessage}
        />
      ) : null}

      {activeTab === "about" ? (
        <div className="rounded-2xl border-2 border-kid-purple/20 bg-white/95 p-4 shadow-sm">
          <p className="text-sm leading-relaxed text-kid-ink">
            Frederick Douglass was one of the most photographed people of the 1800s. He rarely
            smiled in portraits. He wore formal clothes, looked directly into the camera, and used
            his image to challenge racist stereotypes.
          </p>
        </div>
      ) : null}

      {activeTab === "strategy" ? (
        <div className="space-y-4">
          <div className="rounded-2xl border-2 border-kid-purple/25 bg-white/90 px-4 py-3 shadow-sm">
            <p className="text-sm font-black text-kid-ink">Your profile strategy</p>
            <p className="mt-1 text-xs text-kid-ink-muted">
              Write three ways you will use your profile — like Douglass used image, words, and
              public presence.
            </p>
          </div>

          <div className="rounded-2xl border-2 border-kid-purple/20 bg-white/95 p-4 shadow-sm">
            <ul className="space-y-4">
              {draft.strategyPoints.map((bullet, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span
                    className="mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-kid-purple text-xs font-black text-white"
                    aria-hidden
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Label htmlFor={`strategy-point-${index}`} className="font-bold text-kid-ink">
                      Strategy point {index + 1}
                    </Label>
                    <Input
                      id={`strategy-point-${index}`}
                      value={bullet}
                      onChange={(event) => {
                        const nextPoints = [...draft.strategyPoints];
                        nextPoints[index] = event.target.value;
                        updateDraft({ strategyPoints: nextPoints });
                      }}
                      placeholder={DEFAULT_STRATEGY_POINTS[index]}
                      className="mt-2 border-zinc-300 bg-white text-kid-ink"
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {activeTab === "grid" ? (
        <>
          <div className="rounded-2xl border-2 border-kid-purple/25 bg-white/90 px-4 py-3 shadow-sm">
            <p className="text-sm font-black text-kid-ink">
              Step 2: {readyCount} of {DOUGLASS_PROFILE_POSTS.length} posts ready
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-kid-lavender/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-kid-purple to-emerald-500 transition-all"
                style={{
                  width: `${(readyCount / DOUGLASS_PROFILE_POSTS.length) * 100}%`,
                }}
              />
            </div>
            <p className="mt-2 text-xs text-kid-ink-muted">
              Tap a post to open the editor. Finish all 3 to complete your profile grid.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {DOUGLASS_PROFILE_POSTS.map((post) => {
              const postDraft = draft.posts[post.postKey];
              const status = getPostStatus(postDraft);
              const selectedPreset = getDouglassPhotoPreset(postDraft.selectedPhotoId);

              return (
                <button
                  key={post.postKey}
                  type="button"
                  onClick={() => setEditingPostKey(post.postKey)}
                  className="group touch-manipulation overflow-hidden rounded-2xl border-2 border-kid-purple/20 bg-white text-left shadow-sm transition hover:border-kid-purple/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kid-purple/50"
                >
                  <div className="relative">
                    <DouglassPresetPhotoVisual
                      preset={selectedPreset}
                      emptyLabel="Choose image"
                      className="aspect-square w-full"
                    />
                    <span
                      className={cn(
                        "absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide",
                        STATUS_STYLES[status],
                      )}
                    >
                      {status}
                    </span>
                    {selectedPreset ? (
                      <span className="absolute bottom-2 left-2 max-w-[85%] rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                        {selectedPreset.title} · {selectedPreset.mood}
                      </span>
                    ) : null}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-black text-kid-ink group-hover:text-kid-purple">
                      {post.title}
                    </p>
                    <p className="mt-1 text-xs text-kid-ink-muted">Tap to edit</p>
                  </div>
                </button>
              );
            })}
          </div>

          {draftedFeedPosts.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-base font-black text-kid-ink">Profile Preview</h3>
              <div className="space-y-4">
                {draftedFeedPosts.map((post) => {
                  const postDraft = draft.posts[post.postKey];
                  const selectedPreset = getDouglassPhotoPreset(postDraft.selectedPhotoId);

                  return (
                    <article
                      key={`feed-${post.postKey}`}
                      className="overflow-hidden rounded-2xl border-2 border-kid-purple/20 bg-white shadow-sm"
                    >
                      <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3">
                        <DouglassProfileAvatar
                          avatarPhotoId={draft.avatarPhotoId}
                          displayName={draft.profileDisplayName}
                          size="sm"
                        />
                        <div>
                          <p className="text-sm font-black text-kid-ink">
                            {draft.profileDisplayName.trim() || DOUGLASS_PROFILE_DEFAULTS.profileDisplayName}
                          </p>
                          <p className="text-xs font-semibold text-kid-ink-muted">
                            {formatDouglassProfileHandle(draft.profileHandle)}
                          </p>
                        </div>
                      </div>

                      <DouglassPresetPhotoVisual
                        preset={selectedPreset}
                        emptyLabel="Choose image"
                        className="aspect-[4/3] w-full"
                      />

                      <div className="space-y-3 px-4 py-4">
                        <div>
                          <p className="text-sm font-black text-kid-ink">{post.title}</p>
                          <p className="mt-1 text-sm leading-relaxed text-kid-ink">
                            &ldquo;{post.requiredQuote}&rdquo;
                          </p>
                          {postDraft.modernCaption.trim() ? (
                            <p className="mt-2 text-sm font-semibold text-violet-700">
                              {postDraft.modernCaption.trim()}
                            </p>
                          ) : null}
                        </div>

                        <div className="rounded-xl border border-violet-200/80 bg-violet-50/60 px-3 py-2.5">
                          <p className="text-[10px] font-black uppercase tracking-wide text-violet-700">
                            Why this post matters
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-kid-ink">
                            {postDraft.strategyExplanation.trim()}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="button" variant="reward" fullWidth className="font-bold" onClick={handleSaveProfile}>
          Save Profile Draft
        </Button>
        <Button type="button" variant="neutral" fullWidth onClick={handleClear}>
          Clear Draft
        </Button>
      </div>

      {profileViewHref ? (
        <ViewProfilePageCallout profileViewHref={profileViewHref} />
      ) : null}

      {saveMessage ? (
        <p
          className={cn(
            "text-sm",
            saveMessage.includes("Could not") ? "text-red-600" : "text-emerald-700",
          )}
        >
          {saveMessage}
        </p>
      ) : null}

      {editingPost ? (
        <PostEditorModal
          post={editingPost}
          draft={draft.posts[editingPost.postKey]}
          onSave={(patch) => updatePost(editingPost.postKey, patch)}
          onClose={() => setEditingPostKey(null)}
        />
      ) : null}
    </div>
  );
}
