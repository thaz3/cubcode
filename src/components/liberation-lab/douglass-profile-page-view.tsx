"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DouglassPresetPhotoVisual,
  DouglassProfileAvatar,
} from "@/components/liberation-lab/douglass-profile-lab";
import {
  DOUGLASS_PROFILE_DEFAULTS,
  formatDouglassProfileHandle,
  getCustomPostDraft,
  getCustomPostStatus,
  getQuoteCardsForDraft,
  MAX_SELECTED_QUOTES,
  parseDouglassProfileDraft,
  type DouglassProfileLabDraft,
} from "@/lib/liberation-lab/douglass-profile-model";
import { getProfileMottoForPhoto } from "@/lib/liberation-lab/douglass-photo-presets";
import { getQuoteCardPhotoPreset } from "@/lib/liberation-lab/douglass-quote-cards";
import { cn } from "@/lib/utils";

type ProfileViewTab = "posts" | "about";

type DouglassProfilePageViewProps = {
  storageKey: string;
  profileLabHref: string;
  backHref: string;
};

function formatHashtags(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed
    .split(/\s+/)
    .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
    .join(" ");
}

function countReadyPosts(draft: DouglassProfileLabDraft): number {
  return draft.selectedQuoteIds.filter(
    (quoteId) => getCustomPostStatus(getCustomPostDraft(draft, quoteId)) === "Ready",
  ).length;
}

export function DouglassProfilePageView({
  storageKey,
  profileLabHref,
  backHref,
}: DouglassProfilePageViewProps) {
  const [draft, setDraft] = useState<DouglassProfileLabDraft | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileViewTab>("posts");
  const [expandedQuoteId, setExpandedQuoteId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        setDraft(parseDouglassProfileDraft(JSON.parse(raw) as Record<string, unknown>));
      }
    } catch {
      setDraft(null);
    } finally {
      setHydrated(true);
    }
  }, [storageKey]);

  const displayName =
    draft?.profileDisplayName.trim() || DOUGLASS_PROFILE_DEFAULTS.profileDisplayName;
  const handle = formatDouglassProfileHandle(draft?.profileHandle ?? "");
  const bio = draft?.profileBio.trim() || DOUGLASS_PROFILE_DEFAULTS.profileBio;
  const profileAbout = draft?.profileAbout.trim() || DOUGLASS_PROFILE_DEFAULTS.profileAbout;
  const profileMotto = getProfileMottoForPhoto(draft?.avatarPhotoId);
  const readyCount = draft ? countReadyPosts(draft) : 0;

  const feedCards = useMemo(() => (draft ? getQuoteCardsForDraft(draft) : []), [draft]);

  if (!hydrated) {
    return <p className="text-sm text-kid-ink-muted">Loading profile…</p>;
  }

  if (!draft) {
    return (
      <div className="mx-auto max-w-lg space-y-4 rounded-3xl border-2 border-kid-purple/20 bg-white p-6 text-center shadow-sm">
        <p className="text-lg font-black text-kid-ink">No profile saved yet</p>
        <Link href={profileLabHref}>
          <Button type="button" variant="reward" fullWidth className="font-bold">
            Open Profile Lab
          </Button>
        </Link>
        <Link href={backHref} className="inline-block text-sm font-bold text-kid-purple underline">
          ← Back to mission steps
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg overflow-hidden rounded-3xl border-2 border-zinc-200 bg-white shadow-xl">
      <div className="border-b border-zinc-100 bg-white px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-sm font-black text-kid-ink">{handle}</p>
          <Link
            href={profileLabHref}
            className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-800"
          >
            Edit in Lab
          </Link>
        </div>
      </div>

      <div className="px-4 py-5">
        <div className="flex items-start gap-4">
          <DouglassProfileAvatar
            avatarPhotoId={draft.avatarPhotoId}
            displayName={displayName}
            size="md"
          />
          <div className="grid flex-1 grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-black text-kid-ink">{readyCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-kid-ink-muted">Ready</p>
            </div>
            <div>
              <p className="text-lg font-black text-kid-ink">{feedCards.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-kid-ink-muted">Posts</p>
            </div>
            <div>
              <p className="text-lg font-black text-kid-ink">{MAX_SELECTED_QUOTES}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-kid-ink-muted">Slots</p>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-base font-black text-kid-ink">{displayName}</p>
          <p className="text-sm leading-relaxed text-kid-ink">{bio}</p>
          <p className="text-sm font-bold italic text-violet-700">&ldquo;{profileMotto}&rdquo;</p>
        </div>
      </div>

      <div className="grid grid-cols-2 border-y border-zinc-100">
        {(
          [
            { id: "posts", label: "Posts" },
            { id: "about", label: "About" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "min-h-11 touch-manipulation py-3 text-xs font-black uppercase tracking-wide transition",
              activeTab === tab.id
                ? "border-b-2 border-kid-purple text-kid-purple"
                : "text-kid-ink-muted hover:text-kid-ink",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "about" ? (
        <div className="space-y-4 px-4 py-5">
          <p className="text-sm leading-relaxed text-kid-ink">{profileAbout}</p>
          <div className="rounded-2xl border border-violet-200 bg-violet-50/70 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-wide text-violet-700">
              Profile strategy
            </p>
            <ul className="mt-2 space-y-2 text-sm text-kid-ink">
              {draft.strategyPoints.map((point, index) => (
                <li key={`${index}-${point}`}>{point}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-0">
          <div className="grid grid-cols-3 gap-0.5 bg-zinc-100 p-0.5">
            {Array.from({ length: MAX_SELECTED_QUOTES }).map((_, index) => {
              const card = feedCards[index] ?? null;
              const quoteId = draft.selectedQuoteIds[index];
              const selected = expandedQuoteId === quoteId;

              return (
                <button
                  key={`grid-slot-${index}`}
                  type="button"
                  onClick={() =>
                    quoteId
                      ? setExpandedQuoteId((current) => (current === quoteId ? null : quoteId))
                      : undefined
                  }
                  className={cn(
                    "relative touch-manipulation overflow-hidden bg-white transition",
                    selected && "ring-2 ring-inset ring-kid-purple",
                  )}
                  disabled={!card}
                >
                  {card ? (
                    <DouglassPresetPhotoVisual
                      preset={getQuoteCardPhotoPreset(card)}
                      emptyLabel="—"
                      className="aspect-square w-full"
                    />
                  ) : (
                    <div className="flex aspect-square w-full items-center justify-center bg-zinc-50 text-xs font-bold text-zinc-400">
                      —
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {feedCards.length === 0 ? (
            <div className="space-y-3 px-4 py-8 text-center">
              <p className="text-sm font-bold text-kid-ink">No posts yet</p>
              <Link href={profileLabHref}>
                <Button type="button" variant="reward" size="md" className="font-bold">
                  Build posts in Lab
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {feedCards.map((card) => {
                const postDraft = getCustomPostDraft(draft, card.id);
                const expanded = expandedQuoteId === null || expandedQuoteId === card.id;
                if (!expanded) return null;

                return (
                  <article key={card.id}>
                    <DouglassPresetPhotoVisual
                      preset={getQuoteCardPhotoPreset(card)}
                      emptyLabel="Choose image"
                      className="aspect-square w-full"
                    />
                    <div className="space-y-3 px-4 py-4">
                      <p className="text-sm font-black text-kid-ink">{card.title}</p>
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
          )}
        </div>
      )}
    </div>
  );
}
