"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DOUGLASS_PHOTO_PRESETS,
  getDouglassPhotoPreset,
  getProfileMottoForPhoto,
  type DouglassPhotoPreset,
} from "@/lib/liberation-lab/douglass-photo-presets";
import {
  createEmptyDraft,
  countReadyPosts,
  DEFAULT_STRATEGY_POINTS,
  DOUGLASS_PROFILE_DEFAULTS,
  formatDouglassProfileHandle,
  getCustomPostDraft,
  getCustomPostStatus,
  getQuoteCardsForDraft,
  GRID_SLOT_LABELS,
  isProfileSetupStarted,
  MAX_SELECTED_QUOTES,
  normalizeHandle,
  parseDouglassProfileDraft,
  selectAvatarPhoto,
  toggleQuoteSelection,
  type CustomPostDraft,
  type CustomPostStatus,
  type DouglassProfileLabDraft,
} from "@/lib/liberation-lab/douglass-profile-model";
import {
  DOUGLASS_QUOTE_CARDS,
  getDouglassQuoteCard,
  getQuoteCardPhotoPreset,
  type DouglassQuoteCard,
} from "@/lib/liberation-lab/douglass-quote-cards";
import { cn } from "@/lib/utils";

export {
  createEmptyDraft,
  DEFAULT_STRATEGY_POINTS,
  DOUGLASS_PROFILE_DEFAULTS,
  formatDouglassProfileHandle,
  getCustomPostDraft,
  getCustomPostStatus,
  parseDouglassProfileDraft,
  type CustomPostDraft,
  type DouglassProfileLabDraft,
} from "@/lib/liberation-lab/douglass-profile-model";

type ProfileTab = "profile" | "quote-bank" | "grid" | "about" | "strategy";

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

const PROFILE_TABS: {
  id: ProfileTab;
  label: string;
  hint: string;
  icon: string;
}[] = [
  { id: "profile", label: "Profile", hint: "Name, handle, bio & photo", icon: "👤" },
  { id: "quote-bank", label: "Quote Bank", hint: "Pick your 3 quotes", icon: "🃏" },
  { id: "grid", label: "Grid", hint: "Build your 3 posts", icon: "▦" },
  { id: "about", label: "About", hint: "Write the about section", icon: "📖" },
  { id: "strategy", label: "Strategy", hint: "Plan your 3 profile moves", icon: "🎯" },
];

const STATUS_STYLES: Record<CustomPostStatus, string> = {
  "Needs modern translation": "bg-zinc-500/90 text-white",
  Drafted: "bg-amber-500/90 text-amber-950",
  Ready: "bg-emerald-500/90 text-emerald-950",
};

function getDisplayInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "FD";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
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

function QuoteCardPhotoVisual({
  card,
  className,
}: {
  card: DouglassQuoteCard;
  className?: string;
}) {
  return (
    <DouglassPresetPhotoVisual
      preset={getQuoteCardPhotoPreset(card)}
      emptyLabel="Portrait"
      className={className}
    />
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

function ProfileHeaderPreview({
  draft,
  onEditAvatar,
}: {
  draft: DouglassProfileLabDraft;
  onEditAvatar: () => void;
}) {
  const displayName = draft.profileDisplayName.trim() || DOUGLASS_PROFILE_DEFAULTS.profileDisplayName;
  const handle = formatDouglassProfileHandle(draft.profileHandle);
  const bio = draft.profileBio.trim() || DOUGLASS_PROFILE_DEFAULTS.profileBio;
  const profileMotto = getProfileMottoForPhoto(draft.avatarPhotoId);

  return (
    <div className="px-4 py-5">
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={onEditAvatar}
          className="group relative shrink-0 touch-manipulation rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-violet-950"
          aria-label="Change profile photo"
        >
          <DouglassProfileAvatar avatarPhotoId={draft.avatarPhotoId} displayName={displayName} />
          <span
            className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-violet-950 bg-amber-300 text-[11px] font-black text-violet-950 shadow-md"
            aria-hidden
          >
            ✎
          </span>
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-xl font-black text-white">{displayName}</p>
          <p className="text-sm font-semibold text-violet-200">{handle}</p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-200">{bio}</p>
          <p className="mt-2 text-xs font-bold italic text-amber-200/90">
            &ldquo;{profileMotto}&rdquo;
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {[
          `${draft.selectedQuoteIds.length} of ${MAX_SELECTED_QUOTES} quotes`,
          `${countReadyPosts(draft)} of ${MAX_SELECTED_QUOTES} posts ready`,
          "Freedom voice",
        ].map((chip) => (
          <span
            key={chip}
            className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-zinc-100"
          >
            {chip}
          </span>
        ))}
      </div>

      <p className="mt-4 text-sm leading-relaxed text-violet-100/90">
        Build a profile that shows how Douglass used image, words, and public presence to control
        his own story.
      </p>
    </div>
  );
}

function ProfileLabSectionNav({
  activeTab,
  onSelect,
}: {
  activeTab: ProfileTab;
  onSelect: (tab: ProfileTab) => void;
}) {
  return (
    <div className="rounded-2xl border-2 border-kid-purple/25 bg-white p-3 shadow-sm">
      <p className="text-center text-xs font-black uppercase tracking-wide text-kid-purple">
        Tap a section to edit
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {PROFILE_TABS.map((tab) => {
          const selected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(tab.id)}
              className={cn(
                "touch-manipulation rounded-2xl border-2 px-3 py-3 text-left transition",
                selected
                  ? "border-kid-purple bg-violet-50 ring-2 ring-kid-purple/25 shadow-sm"
                  : "border-zinc-200 bg-white hover:border-kid-purple/40 hover:bg-violet-50/60 active:scale-[0.98]",
              )}
            >
              <span className="text-lg" aria-hidden>
                {tab.icon}
              </span>
              <p className="mt-1 text-sm font-black text-kid-ink">{tab.label}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-kid-ink-muted">{tab.hint}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ActiveSectionHeader({ tab }: { tab: (typeof PROFILE_TABS)[number] }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border-2 border-kid-purple/20 bg-gradient-to-r from-violet-50 via-white to-amber-50 px-4 py-3 shadow-sm">
      <span className="text-2xl" aria-hidden>
        {tab.icon}
      </span>
      <div>
        <p className="text-[10px] font-black uppercase tracking-wider text-kid-purple">
          You&apos;re editing
        </p>
        <p className="text-base font-black text-kid-ink">{tab.label}</p>
        <p className="text-xs text-kid-ink-muted">{tab.hint}</p>
      </div>
    </div>
  );
}

function ProfileSetupPanel({
  draft,
  onChange,
  onSaveSetup,
  onEditAvatar,
  setupMessage,
}: {
  draft: DouglassProfileLabDraft;
  onChange: (patch: Partial<DouglassProfileLabDraft>) => void;
  onSaveSetup: () => void;
  onEditAvatar: () => void;
  setupMessage: string | null;
}) {
  const displayName =
    draft.profileDisplayName.trim() || DOUGLASS_PROFILE_DEFAULTS.profileDisplayName;
  const selectedAvatar = getDouglassPhotoPreset(draft.avatarPhotoId);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-kid-purple/25 bg-white/90 px-4 py-3 shadow-sm">
        <p className="text-sm font-black text-kid-ink">Step 1: Profile identity</p>
        <p className="mt-1 text-xs text-kid-ink-muted">
          Set display name, username, bio, portrait, and motto. Use About for the longer section.
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
        <Label className="font-bold text-kid-ink">Profile photo & motto</Label>
        <div className="mt-3 flex items-center gap-4">
          <button
            type="button"
            onClick={onEditAvatar}
            className="relative shrink-0 touch-manipulation rounded-full"
            aria-label="Change profile photo"
          >
            <DouglassProfileAvatar avatarPhotoId={draft.avatarPhotoId} displayName={displayName} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-kid-ink">{selectedAvatar?.title ?? "Choose portrait"}</p>
            <Button type="button" variant="neutral" size="sm" className="mt-2 font-bold" onClick={onEditAvatar}>
              Choose portrait
            </Button>
          </div>
        </div>
        {selectedAvatar ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3">
            <p className="text-sm font-bold italic text-kid-ink">
              &ldquo;{selectedAvatar.profileMotto}&rdquo;
            </p>
          </div>
        ) : null}
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

function QuoteBankPanel({
  draft,
  onToggleQuote,
  bankMessage,
}: {
  draft: DouglassProfileLabDraft;
  onToggleQuote: (quoteCardId: string) => void;
  bankMessage: string | null;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-kid-purple/25 bg-white/90 px-4 py-3 shadow-sm">
        <p className="text-sm font-black text-kid-ink">Step 2: Choose 3 quotes</p>
        <p className="mt-1 text-xs text-kid-ink-muted">
          {draft.selectedQuoteIds.length} of {MAX_SELECTED_QUOTES} quotes selected. Pick any 3 cards
          from the bank below.
        </p>
      </div>

      {bankMessage ? (
        <p className="text-sm font-semibold text-amber-800" role="alert">
          {bankMessage}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {DOUGLASS_QUOTE_CARDS.map((card) => {
          const selected = draft.selectedQuoteIds.includes(card.id);
          return (
            <div
              key={card.id}
              className={cn(
                "overflow-hidden rounded-2xl border-2 bg-white shadow-sm",
                selected ? "border-kid-purple ring-2 ring-kid-purple/25" : "border-zinc-200",
              )}
            >
              <QuoteCardPhotoVisual card={card} className="aspect-[4/3] w-full" />
              <div className="space-y-2 p-4">
                <p className="text-sm font-black text-kid-ink">{card.title}</p>
                <p className="text-sm font-semibold italic leading-snug text-kid-ink">
                  &ldquo;{card.quote}&rdquo;
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-800">
                    {card.theme}
                  </span>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                    {card.mood}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-kid-ink-muted">{card.context}</p>
                <Button
                  type="button"
                  variant={selected ? "constructive" : "neutral"}
                  fullWidth
                  className="font-bold"
                  onClick={() => onToggleQuote(card.id)}
                >
                  {selected ? "Selected" : "Choose this quote"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AvatarPhotoPickerModal({
  selectedPhotoId,
  onSelect,
  onClose,
}: {
  selectedPhotoId: string;
  onSelect: (photoId: string) => void;
  onClose: () => void;
}) {
  const titleId = useId();

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

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close portrait picker"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border-2 border-kid-purple/30 bg-gradient-to-br from-violet-50 via-white to-kid-cream shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-violet-200/80 px-4 py-4 sm:px-5">
          <div>
            <h3 id={titleId} className="text-lg font-black text-kid-ink">
              Choose your avatar
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 min-w-11 shrink-0 rounded-full border border-zinc-300 bg-white text-lg font-bold text-kid-ink-muted"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto px-4 py-4 sm:px-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {DOUGLASS_PHOTO_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  onSelect(preset.id);
                  onClose();
                }}
                className={cn(
                  "touch-manipulation overflow-hidden rounded-2xl border-2 text-left transition",
                  selectedPhotoId === preset.id
                    ? "border-kid-purple ring-2 ring-kid-purple/30"
                    : "border-zinc-200 hover:border-kid-purple/40",
                )}
              >
                <DouglassPresetPhotoVisual preset={preset} className="aspect-square w-full rounded-none border-0" />
                <p className="px-2 py-2 text-xs font-bold text-kid-ink">{preset.title}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PostEditorModal({
  card,
  draft,
  onSave,
  onClose,
}: {
  card: DouglassQuoteCard;
  draft: CustomPostDraft;
  onSave: (patch: CustomPostDraft) => void;
  onClose: () => void;
}) {
  const titleId = useId();
  const [editorDraft, setEditorDraft] = useState<CustomPostDraft>(draft);

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
                {card.title}
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

          <QuoteCardPhotoVisual card={card} className="mt-4 aspect-[4/3] w-full rounded-2xl" />

          <blockquote className="mt-4 rounded-xl border border-violet-200/80 bg-white/90 px-3 py-2.5">
            <p className="text-sm font-semibold italic leading-relaxed text-kid-ink">
              &ldquo;{card.quote}&rdquo;
            </p>
            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-kid-ink-muted">
              Frederick Douglass quote
            </p>
          </blockquote>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-800">
              {card.theme}
            </span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
              {card.mood}
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-kid-ink-muted">{card.context}</p>

          <div className="mt-4">
            <Label htmlFor="modernTranslation" className="text-kid-ink">
              Translate this quote into modern speak
            </Label>
            <textarea
              id="modernTranslation"
              value={editorDraft.modernTranslation}
              onChange={(event) =>
                setEditorDraft((current) => ({ ...current, modernTranslation: event.target.value }))
              }
              rows={3}
              placeholder="Say what Douglass means in your own words..."
              className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base text-kid-ink outline-none ring-kid-purple/30 placeholder:text-zinc-400 focus:ring-2"
            />
          </div>

          <div className="mt-4">
            <Label htmlFor="socialCaption" className="text-kid-ink">
              Write the caption for this post
            </Label>
            <textarea
              id="socialCaption"
              value={editorDraft.socialCaption}
              onChange={(event) =>
                setEditorDraft((current) => ({ ...current, socialCaption: event.target.value }))
              }
              rows={3}
              placeholder="Make it sound like a powerful post people would understand today..."
              className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base text-kid-ink outline-none ring-kid-purple/30 placeholder:text-zinc-400 focus:ring-2"
            />
          </div>

          <div className="mt-4">
            <Label htmlFor="hashtags" className="text-kid-ink">
              Add hashtags
            </Label>
            <Input
              id="hashtags"
              value={editorDraft.hashtags}
              onChange={(event) =>
                setEditorDraft((current) => ({ ...current, hashtags: event.target.value }))
              }
              placeholder="#Freedom #BooksArePower #SpeakTruth"
              className="mt-2 border-zinc-300 bg-white text-kid-ink"
            />
          </div>

          <div className="mt-4">
            <Label htmlFor="whyThisPostBelongs" className="text-kid-ink">
              Why does this post belong on Frederick Douglass&apos;s profile?
            </Label>
            <textarea
              id="whyThisPostBelongs"
              value={editorDraft.whyThisPostBelongs}
              onChange={(event) =>
                setEditorDraft((current) => ({
                  ...current,
                  whyThisPostBelongs: event.target.value,
                }))
              }
              rows={3}
              placeholder="Explain how this quote connects to Douglass, freedom, literacy, or resistance."
              className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base text-kid-ink outline-none ring-kid-purple/30 placeholder:text-zinc-400 focus:ring-2"
            />
            <p className="mt-1 text-xs text-kid-ink-muted">
              Write at least 40 characters here to mark this post Ready.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-violet-200/80 bg-white/80 px-4 py-4 sm:flex-row">
          <Button type="button" variant="reward" fullWidth className="font-bold" onClick={() => onSave(editorDraft)}>
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

function AssignmentBrief() {
  return (
    <div className="rounded-2xl border-2 border-kid-purple/30 bg-gradient-to-br from-violet-50 via-white to-amber-50 p-4 shadow-sm">
      <p className="text-sm font-black text-kid-ink">Your assignment</p>
      <p className="mt-2 text-sm leading-relaxed text-kid-ink">
        Build a social media profile for Frederick Douglass.{" "}
        <span className="font-bold">You are in charge of everything.</span> Graded for{" "}
        <span className="font-bold">accuracy</span> and <span className="font-bold">creativity</span>.
      </p>
      <ol className="mt-3 list-decimal space-y-1.5 pl-4 text-xs leading-relaxed text-kid-ink-muted">
        <li>Set up profile: display name, username, bio, portrait, motto</li>
        <li>Pick 3 quotes from the Quote Bank</li>
        <li>Customize each post: modern translation, caption, hashtags, and why it belongs</li>
      </ol>
    </div>
  );
}

function ViewProfilePageCallout({ profileViewHref }: { profileViewHref: string }) {
  return (
    <div className="rounded-2xl border-2 border-kid-purple/30 bg-gradient-to-r from-violet-50 via-white to-amber-50 px-4 py-3 shadow-sm">
      <p className="text-sm font-black text-kid-ink">See your profile as a page</p>
      <Link href={profileViewHref} className="mt-3 block">
        <Button type="button" fullWidth className="border-2 border-kid-purple bg-kid-purple font-bold text-white hover:bg-violet-700">
          View Profile Page →
        </Button>
      </Link>
    </div>
  );
}

function formatHashtags(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed
    .split(/\s+/)
    .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
    .join(" ");
}

export function DouglassProfileLab({ storageKey, profileViewHref }: { storageKey: string; profileViewHref?: string }) {
  const [draft, setDraft] = useState<DouglassProfileLabDraft>(createEmptyDraft);
  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [setupMessage, setSetupMessage] = useState<string | null>(null);
  const [bankMessage, setBankMessage] = useState<string | null>(null);
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
  const editingCard = useMemo(() => getDouglassQuoteCard(editingQuoteId), [editingQuoteId]);
  const activeTabMeta = useMemo(
    () => PROFILE_TABS.find((tab) => tab.id === activeTab) ?? PROFILE_TABS[0],
    [activeTab],
  );
  const feedCards = useMemo(() => getQuoteCardsForDraft(draft), [draft]);

  const updateDraft = useCallback((patch: Partial<DouglassProfileLabDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setSaveMessage(null);
    setSetupMessage(null);
  }, []);

  const updateCustomPost = useCallback((quoteCardId: string, patch: CustomPostDraft) => {
    setDraft((current) => ({
      ...current,
      customPosts: { ...current.customPosts, [quoteCardId]: patch },
    }));
    setSaveMessage(null);
    setSetupMessage(null);
  }, []);

  function handleToggleQuote(quoteCardId: string) {
    const result = toggleQuoteSelection(draft, quoteCardId);
    setDraft(result.draft);
    setBankMessage(result.message);
    setSaveMessage(null);
  }

  function persistDraft(nextDraft: DouglassProfileLabDraft) {
    localStorage.setItem(storageKey, JSON.stringify(nextDraft));
  }

  if (!hydrated) {
    return <p className="text-sm text-kid-ink-muted">Loading profile lab…</p>;
  }

  return (
    <div className="space-y-5">
      <AssignmentBrief />
      {profileViewHref ? <ViewProfilePageCallout profileViewHref={profileViewHref} /> : null}

      <div className="overflow-hidden rounded-2xl border-2 border-kid-purple/25 bg-gradient-to-br from-slate-900 via-violet-950 to-indigo-950 shadow-md">
        <ProfileHeaderPreview draft={draft} onEditAvatar={() => setAvatarPickerOpen(true)} />
      </div>

      <ProfileLabSectionNav activeTab={activeTab} onSelect={setActiveTab} />

      <div className="rounded-2xl border-2 border-amber-300/40 bg-gradient-to-r from-amber-50 via-white to-violet-50 px-4 py-3 shadow-sm">
        <p className="text-sm font-black text-kid-ink">
          {draft.selectedQuoteIds.length} of {MAX_SELECTED_QUOTES} quotes selected · {readyCount} of{" "}
          {MAX_SELECTED_QUOTES} posts ready
        </p>
        <p className="mt-1 text-xs text-kid-ink-muted">
          {profileStarted
            ? "Profile ready — pick quotes in Quote Bank, then build posts in Grid."
            : "Start in Profile, then choose 3 quotes from the Quote Bank."}
        </p>
      </div>

      <ActiveSectionHeader tab={activeTabMeta} />

      {activeTab === "profile" ? (
        <ProfileSetupPanel
          draft={draft}
          onChange={updateDraft}
          onSaveSetup={() => {
            persistDraft(draft);
            setSetupMessage("Profile setup saved. Now choose quotes in the Quote Bank.");
          }}
          onEditAvatar={() => setAvatarPickerOpen(true)}
          setupMessage={setupMessage}
        />
      ) : null}

      {activeTab === "quote-bank" ? (
        <QuoteBankPanel draft={draft} onToggleQuote={handleToggleQuote} bankMessage={bankMessage} />
      ) : null}

      {activeTab === "about" ? (
        <div className="rounded-2xl border-2 border-kid-purple/20 bg-white/95 p-4 shadow-sm">
          <Label htmlFor="profileAbout" className="text-kid-ink">
            About text
          </Label>
          <textarea
            id="profileAbout"
            value={draft.profileAbout}
            onChange={(event) => updateDraft({ profileAbout: event.target.value })}
            rows={6}
            placeholder={DOUGLASS_PROFILE_DEFAULTS.profileAbout}
            className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base text-kid-ink outline-none ring-kid-purple/30 placeholder:text-zinc-400 focus:ring-2"
          />
        </div>
      ) : null}

      {activeTab === "strategy" ? (
        <div className="rounded-2xl border-2 border-kid-purple/20 bg-white/95 p-4 shadow-sm">
          <ul className="space-y-4">
            {draft.strategyPoints.map((bullet, index) => (
              <li key={index}>
                <Label htmlFor={`strategy-point-${index}`}>Strategy point {index + 1}</Label>
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
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {activeTab === "grid" ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {GRID_SLOT_LABELS.map((slotLabel, index) => {
              const quoteId = draft.selectedQuoteIds[index];
              const card = quoteId ? getDouglassQuoteCard(quoteId) : null;
              const postDraft = quoteId ? getCustomPostDraft(draft, quoteId) : null;
              const status = postDraft ? getCustomPostStatus(postDraft) : null;

              if (!card) {
                return (
                  <button
                    key={slotLabel}
                    type="button"
                    onClick={() => setActiveTab("quote-bank")}
                    className="flex min-h-48 touch-manipulation flex-col items-center justify-center rounded-2xl border-2 border-dashed border-kid-purple/40 bg-violet-50/50 p-6 text-center transition hover:border-kid-purple hover:bg-violet-50"
                  >
                    <span className="text-2xl font-black text-kid-purple">+</span>
                    <p className="mt-2 text-sm font-black text-kid-ink">{slotLabel}</p>
                    <p className="mt-1 text-xs text-kid-ink-muted">Choose a quote</p>
                  </button>
                );
              }

              return (
                <button
                  key={slotLabel}
                  type="button"
                  onClick={() => setEditingQuoteId(card.id)}
                  className="touch-manipulation overflow-hidden rounded-2xl border-2 border-kid-purple/20 bg-white text-left shadow-sm transition hover:border-kid-purple/50"
                >
                  <div className="relative">
                    <QuoteCardPhotoVisual card={card} className="aspect-square w-full" />
                    {status ? (
                      <span
                        className={cn(
                          "absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide",
                          STATUS_STYLES[status],
                        )}
                      >
                        {status}
                      </span>
                    ) : null}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-black text-kid-ink">{slotLabel}</p>
                    <p className="mt-1 text-xs font-bold text-kid-ink">{card.title}</p>
                    <p className="mt-1 text-[11px] text-kid-ink-muted">{card.theme}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {feedCards.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-base font-black text-kid-ink">Profile preview</h3>
              {feedCards.map((card) => {
                const postDraft = getCustomPostDraft(draft, card.id);
                return (
                  <article
                    key={card.id}
                    className="overflow-hidden rounded-2xl border-2 border-kid-purple/20 bg-white shadow-sm"
                  >
                    <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3">
                      <DouglassProfileAvatar
                        avatarPhotoId={draft.avatarPhotoId}
                        displayName={draft.profileDisplayName}
                        size="sm"
                      />
                      <div>
                        <p className="text-sm font-black text-kid-ink">{draft.profileDisplayName}</p>
                        <p className="text-xs font-semibold text-kid-ink-muted">
                          {formatDouglassProfileHandle(draft.profileHandle)}
                        </p>
                      </div>
                    </div>
                    <QuoteCardPhotoVisual card={card} className="aspect-[4/3] w-full" />
                    <div className="space-y-3 px-4 py-4">
                      <p className="text-sm italic text-kid-ink">&ldquo;{card.quote}&rdquo;</p>
                      {postDraft.modernTranslation.trim() ? (
                        <p className="text-sm leading-relaxed text-kid-ink">
                          {postDraft.modernTranslation.trim()}
                        </p>
                      ) : null}
                      {postDraft.socialCaption.trim() ? (
                        <p className="text-sm font-semibold text-violet-700">
                          {postDraft.socialCaption.trim()}
                        </p>
                      ) : null}
                      {postDraft.hashtags.trim() ? (
                        <p className="text-sm font-semibold text-violet-700">
                          {formatHashtags(postDraft.hashtags)}
                        </p>
                      ) : null}
                      {postDraft.whyThisPostBelongs.trim() ? (
                        <div className="rounded-xl border border-violet-200/80 bg-violet-50/60 px-3 py-2.5">
                          <p className="text-[10px] font-black uppercase tracking-wide text-violet-700">
                            Why this post matters
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-kid-ink">
                            {postDraft.whyThisPostBelongs.trim()}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}
        </>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          variant="reward"
          fullWidth
          className="font-bold"
          onClick={() => {
            persistDraft(draft);
            setSaveMessage(
              "Profile saved. Return to your assignment when you are ready to submit your reflection.",
            );
          }}
        >
          Save Profile Draft
        </Button>
        <Button
          type="button"
          variant="neutral"
          fullWidth
          onClick={() => {
            localStorage.removeItem(storageKey);
            setDraft(createEmptyDraft());
            setEditingQuoteId(null);
            setActiveTab("profile");
            setSaveMessage("Draft cleared.");
          }}
        >
          Clear Draft
        </Button>
      </div>

      {saveMessage ? (
        <p className={cn("text-sm", saveMessage.includes("Could not") ? "text-red-600" : "text-emerald-700")}>
          {saveMessage}
        </p>
      ) : null}

      {editingCard ? (
        <PostEditorModal
          card={editingCard}
          draft={getCustomPostDraft(draft, editingCard.id)}
          onSave={(patch) => {
            updateCustomPost(editingCard.id, patch);
            setEditingQuoteId(null);
          }}
          onClose={() => setEditingQuoteId(null)}
        />
      ) : null}

      {avatarPickerOpen ? (
        <AvatarPhotoPickerModal
          selectedPhotoId={draft.avatarPhotoId}
          onSelect={(photoId) => updateDraft(selectAvatarPhoto(photoId))}
          onClose={() => setAvatarPickerOpen(false)}
        />
      ) : null}
    </div>
  );
}
