"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DOUGLASS_PROFILE_DEFAULTS,
  DOUGLASS_PROFILE_POSTS,
  DouglassPresetPhotoVisual,
  DouglassProfileAvatar,
  formatDouglassProfileHandle,
  getPostStatus,
  parseDouglassProfileDraft,
  type DouglassProfileLabDraft,
  type DouglassProfilePostKey,
} from "@/components/liberation-lab/douglass-profile-lab";
import { getDouglassPhotoPreset } from "@/lib/liberation-lab/douglass-photo-presets";
import { cn } from "@/lib/utils";

type ProfileViewTab = "posts" | "about";

type DouglassProfilePageViewProps = {
  storageKey: string;
  profileLabHref: string;
  backHref: string;
};

function countReadyPosts(draft: DouglassProfileLabDraft): number {
  return DOUGLASS_PROFILE_POSTS.filter(
    (post) => getPostStatus(draft.posts[post.postKey]) === "Ready",
  ).length;
}

function hasPostContent(draft: DouglassProfileLabDraft, postKey: DouglassProfilePostKey): boolean {
  return getPostStatus(draft.posts[postKey]) !== "Empty";
}

export function DouglassProfilePageView({
  storageKey,
  profileLabHref,
  backHref,
}: DouglassProfilePageViewProps) {
  const [draft, setDraft] = useState<DouglassProfileLabDraft | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileViewTab>("posts");
  const [expandedPostKey, setExpandedPostKey] = useState<DouglassProfilePostKey | null>(null);

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
  const readyCount = draft ? countReadyPosts(draft) : 0;

  const feedPosts = useMemo(
    () =>
      draft
        ? DOUGLASS_PROFILE_POSTS.filter((post) => hasPostContent(draft, post.postKey))
        : [],
    [draft],
  );

  if (!hydrated) {
    return <p className="text-sm text-kid-ink-muted">Loading profile…</p>;
  }

  if (!draft) {
    return (
      <div className="mx-auto max-w-lg space-y-4 rounded-3xl border-2 border-kid-purple/20 bg-white p-6 text-center shadow-sm">
        <p className="text-lg font-black text-kid-ink">No profile saved yet</p>
        <p className="text-sm leading-relaxed text-kid-ink-muted">
          Build your Frederick Douglass profile in the Lab first. When you save, come back here to
          see it as a full profile page.
        </p>
        <Link href={profileLabHref}>
          <Button type="button" variant="reward" fullWidth className="font-bold">
            Open Profile Lab
          </Button>
        </Link>
        <Link
          href={backHref}
          className="inline-block text-sm font-bold text-kid-purple underline underline-offset-2"
        >
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
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={profileLabHref}
              className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-800 transition hover:bg-violet-100"
            >
              Edit in Lab
            </Link>
            <Link
              href={backHref}
              className="text-xs font-bold text-kid-ink-muted underline underline-offset-2"
            >
              Mission
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4 py-5">
        <div className="flex items-start gap-4">
          <DouglassProfileAvatar
            avatarStyle={draft.avatarStyle}
            displayName={displayName}
            size="md"
          />
          <div className="grid flex-1 grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-black text-kid-ink">{readyCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-kid-ink-muted">
                Ready
              </p>
            </div>
            <div>
              <p className="text-lg font-black text-kid-ink">{feedPosts.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-kid-ink-muted">
                Posts
              </p>
            </div>
            <div>
              <p className="text-lg font-black text-kid-ink">160+</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-kid-ink-muted">
                Portraits
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-base font-black text-kid-ink">{displayName}</p>
          <p className="text-sm leading-relaxed text-kid-ink">{bio}</p>
          {draft.profileMotto.trim() ? (
            <p className="text-sm font-bold italic text-violet-700">
              &ldquo;{draft.profileMotto.trim()}&rdquo;
            </p>
          ) : null}
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
          <p className="text-sm leading-relaxed text-kid-ink">
            Frederick Douglass was one of the most photographed people of the 1800s. He rarely
            smiled in portraits. He wore formal clothes, looked directly into the camera, and used
            his image to challenge racist stereotypes.
          </p>
          <div className="rounded-2xl border border-violet-200 bg-violet-50/70 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-wide text-violet-700">
              Profile strategy
            </p>
            <ul className="mt-2 space-y-2 text-sm text-kid-ink">
              <li>Control the image</li>
              <li>Use powerful words</li>
              <li>Challenge the audience</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-0">
          <div className="grid grid-cols-3 gap-0.5 bg-zinc-100 p-0.5">
            {DOUGLASS_PROFILE_POSTS.map((post) => {
              const postDraft = draft.posts[post.postKey];
              const preset = getDouglassPhotoPreset(postDraft.selectedPhotoId);
              const selected = expandedPostKey === post.postKey;

              return (
                <button
                  key={post.postKey}
                  type="button"
                  onClick={() =>
                    setExpandedPostKey((current) =>
                      current === post.postKey ? null : post.postKey,
                    )
                  }
                  className={cn(
                    "relative touch-manipulation overflow-hidden bg-white transition",
                    selected && "ring-2 ring-inset ring-kid-purple",
                  )}
                  aria-label={`View ${post.title}`}
                >
                  <DouglassPresetPhotoVisual
                    preset={preset}
                    emptyLabel="—"
                    className="aspect-square w-full"
                  />
                </button>
              );
            })}
          </div>

          {feedPosts.length === 0 ? (
            <div className="space-y-3 px-4 py-8 text-center">
              <p className="text-sm font-bold text-kid-ink">No posts yet</p>
              <p className="text-xs text-kid-ink-muted">
                Add your three featured posts in the Profile Lab to fill this grid.
              </p>
              <Link href={profileLabHref}>
                <Button type="button" variant="reward" size="md" className="font-bold">
                  Build posts in Lab
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {feedPosts.map((post) => {
                const postDraft = draft.posts[post.postKey];
                const preset = getDouglassPhotoPreset(postDraft.selectedPhotoId);
                const expanded = expandedPostKey === null || expandedPostKey === post.postKey;

                if (!expanded) return null;

                return (
                  <article key={`feed-${post.postKey}`}>
                    <div className="flex items-center gap-3 px-4 py-3">
                      <DouglassProfileAvatar
                        avatarStyle={draft.avatarStyle}
                        displayName={displayName}
                        size="sm"
                      />
                      <div>
                        <p className="text-sm font-black text-kid-ink">{displayName}</p>
                        <p className="text-xs font-semibold text-kid-ink-muted">{handle}</p>
                      </div>
                    </div>

                    <DouglassPresetPhotoVisual
                      preset={preset}
                      emptyLabel="Choose image"
                      className="aspect-square w-full"
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

                      {postDraft.selectedStrategy ? (
                        <p className="text-xs font-bold text-kid-ink-muted">
                          Why this image works: {postDraft.selectedStrategy}
                        </p>
                      ) : null}

                      {postDraft.strategyExplanation.trim() ? (
                        <div className="rounded-xl border border-violet-200/80 bg-violet-50/60 px-3 py-2.5">
                          <p className="text-[10px] font-black uppercase tracking-wide text-violet-700">
                            Why this post matters
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-kid-ink">
                            {postDraft.strategyExplanation.trim()}
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
