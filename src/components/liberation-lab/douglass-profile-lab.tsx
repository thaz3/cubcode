"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const IMAGE_STRATEGY_OPTIONS = [
  "Stern portrait",
  "Formal suit",
  "Direct eye contact",
  "Public speaker",
  "Abolitionist newspaper style",
] as const;

export type ImageStrategy = (typeof IMAGE_STRATEGY_OPTIONS)[number];

export const DOUGLASS_PROFILE_POSTS = [
  {
    postKey: "escape",
    title: "The Escape",
    captionQuote:
      "I prayed for freedom for twenty years, but received no answer until I prayed with my legs.",
    prompt: "What does this quote show about action, courage, and freedom?",
  },
  {
    postKey: "fourth-of-july",
    title: "The Fourth of July Speech",
    captionQuote: "What, to the American slave, is your 4th of July?",
    prompt: "Why would Douglass use this question as a public challenge to America?",
  },
  {
    postKey: "call-to-arms",
    title: "The Call to Arms",
    captionQuote:
      "Remember that in a contest with oppression, the man who strikes the first blow is a man.",
    prompt: "What message is Douglass sending about resistance and self-respect?",
  },
] as const;

export type DouglassProfilePostKey = (typeof DOUGLASS_PROFILE_POSTS)[number]["postKey"];

export type DouglassProfilePostDraft = {
  imageStrategy: ImageStrategy | "";
  explanation: string;
  modernCaption: string;
};

export type DouglassProfileLabDraft = {
  posts: Record<DouglassProfilePostKey, DouglassProfilePostDraft>;
};

const EMPTY_POST: DouglassProfilePostDraft = {
  imageStrategy: "",
  explanation: "",
  modernCaption: "",
};

function createEmptyDraft(): DouglassProfileLabDraft {
  return {
    posts: {
      escape: { ...EMPTY_POST },
      "fourth-of-july": { ...EMPTY_POST },
      "call-to-arms": { ...EMPTY_POST },
    },
  };
}

function normalizeDraft(raw: Record<string, unknown>): DouglassProfileLabDraft {
  const empty = createEmptyDraft();
  const postsRaw = raw.posts;

  if (!postsRaw || typeof postsRaw !== "object") {
    return empty;
  }

  for (const post of DOUGLASS_PROFILE_POSTS) {
    const postRaw = (postsRaw as Record<string, unknown>)[post.postKey];
    if (!postRaw || typeof postRaw !== "object") continue;

    const entry = postRaw as Record<string, unknown>;
    const strategy = String(entry.imageStrategy ?? "");
    empty.posts[post.postKey] = {
      imageStrategy: IMAGE_STRATEGY_OPTIONS.includes(strategy as ImageStrategy)
        ? (strategy as ImageStrategy)
        : "",
      explanation: String(entry.explanation ?? ""),
      modernCaption: String(entry.modernCaption ?? ""),
    };
  }

  return empty;
}

function countDraftedPosts(draft: DouglassProfileLabDraft): number {
  return DOUGLASS_PROFILE_POSTS.filter((post) =>
    Boolean(draft.posts[post.postKey].explanation.trim()),
  ).length;
}

const STRATEGY_PLACEHOLDER_STYLES: Record<ImageStrategy, string> = {
  "Stern portrait": "from-slate-800 via-slate-700 to-zinc-900",
  "Formal suit": "from-indigo-900 via-slate-800 to-indigo-950",
  "Direct eye contact": "from-violet-900 via-purple-900 to-fuchsia-950",
  "Public speaker": "from-amber-900 via-orange-950 to-red-950",
  "Abolitionist newspaper style": "from-stone-800 via-zinc-900 to-neutral-950",
};

type DouglassProfileLabProps = {
  storageKey: string;
};

export function DouglassProfileLab({ storageKey }: DouglassProfileLabProps) {
  const [draft, setDraft] = useState<DouglassProfileLabDraft>(createEmptyDraft);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        setDraft(normalizeDraft(JSON.parse(raw) as Record<string, unknown>));
      }
    } catch {
      setDraft(createEmptyDraft());
    } finally {
      setHydrated(true);
    }
  }, [storageKey]);

  const draftedCount = useMemo(() => countDraftedPosts(draft), [draft]);

  const updatePost = useCallback(
    (postKey: DouglassProfilePostKey, patch: Partial<DouglassProfilePostDraft>) => {
      setDraft((current) => ({
        posts: {
          ...current.posts,
          [postKey]: { ...current.posts[postKey], ...patch },
        },
      }));
      setSaveMessage(null);
    },
    [],
  );

  function handleSave() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(draft));
      setSaveMessage(
        "Profile saved. Return to your assignment when you are ready to submit your reflection.",
      );
    } catch {
      setSaveMessage("Could not save your draft. Try again.");
    }
  }

  function handleClear() {
    localStorage.removeItem(storageKey);
    setDraft(createEmptyDraft());
    setSaveMessage("Draft cleared.");
  }

  if (!hydrated) {
    return <p className="text-sm text-kid-ink-muted">Loading profile lab…</p>;
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-kid-ink">Frederick Douglass Profile Lab</h2>
        <p className="mt-2 text-sm leading-relaxed text-kid-ink-muted">
          Frederick Douglass understood that images and words could fight back against lies. In
          this lab, you will build a profile grid that shows how he used portraits, speeches,
          and public presence to control his own story.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border-2 border-kid-purple/25 bg-gradient-to-br from-slate-900 via-violet-950 to-indigo-950 shadow-md">
        <div className="border-b border-white/10 px-4 py-5">
          <div className="flex items-start gap-3">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-amber-300/50 bg-gradient-to-br from-amber-700 to-slate-900 text-lg font-black text-amber-100"
              aria-hidden
            >
              FD
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-black text-white">Frederick Douglass</p>
              <p className="text-sm font-semibold text-violet-200">@frederickdouglass</p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-200">
                Writer. Orator. Abolitionist. I own my image. I speak for freedom.
              </p>
            </div>
          </div>
          <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-white/5 px-2 py-2">
              <dd className="text-sm font-black text-white">160+</dd>
              <dt className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-400">
                Portraits
              </dt>
            </div>
            <div className="rounded-xl bg-white/5 px-2 py-2">
              <dd className="text-sm font-black text-white">3</dd>
              <dt className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-400">
                Featured Posts
              </dt>
            </div>
            <div className="rounded-xl bg-white/5 px-2 py-2">
              <dd className="text-sm font-black text-white">Freedom</dd>
              <dt className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-400">
                Voice
              </dt>
            </div>
          </dl>
        </div>
      </div>

      <div className="rounded-2xl border-2 border-kid-purple/25 bg-white/90 px-4 py-3 shadow-sm">
        <p className="text-sm font-black text-kid-ink">
          {draftedCount} of {DOUGLASS_PROFILE_POSTS.length} posts drafted
        </p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-kid-lavender/60">
          <div
            className="h-full rounded-full bg-gradient-to-r from-kid-purple to-violet-500 transition-all"
            style={{
              width: `${(draftedCount / DOUGLASS_PROFILE_POSTS.length) * 100}%`,
            }}
          />
        </div>
        <p className="mt-2 text-xs text-kid-ink-muted">
          A post counts as drafted when you explain the strategy behind it.
        </p>
      </div>

      <div className="space-y-4">
        {DOUGLASS_PROFILE_POSTS.map((post, index) => {
          const postDraft = draft.posts[post.postKey];

          return (
            <article
              key={post.postKey}
              className="rounded-2xl border-2 border-violet-300/35 bg-gradient-to-br from-violet-50 via-white to-kid-cream p-4 shadow-sm"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600">
                Post {index + 1}
              </p>
              <h3 className="mt-1 text-base font-black text-kid-ink">{post.title}</h3>

              <blockquote className="mt-3 rounded-xl border border-violet-200/80 bg-white/80 px-3 py-2.5">
                <p className="text-sm font-semibold italic leading-relaxed text-kid-ink">
                  &ldquo;{post.captionQuote}&rdquo;
                </p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wide text-kid-ink-muted">
                  Required caption
                </p>
              </blockquote>

              <p className="mt-3 text-sm font-medium text-kid-ink">{post.prompt}</p>

              <div className="mt-4 space-y-4">
                <div>
                  <Label htmlFor={`${post.postKey}-strategy`} className="text-kid-ink">
                    Image strategy
                  </Label>
                  <select
                    id={`${post.postKey}-strategy`}
                    value={postDraft.imageStrategy}
                    onChange={(event) =>
                      updatePost(post.postKey, {
                        imageStrategy: event.target.value as ImageStrategy | "",
                      })
                    }
                    className="mt-2 w-full min-h-11 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-base text-kid-ink outline-none ring-kid-purple/30 focus:ring-2"
                  >
                    <option value="">Choose an image strategy</option>
                    {IMAGE_STRATEGY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor={`${post.postKey}-explanation`} className="text-kid-ink">
                    Explain the strategy behind this post.
                  </Label>
                  <textarea
                    id={`${post.postKey}-explanation`}
                    value={postDraft.explanation}
                    onChange={(event) =>
                      updatePost(post.postKey, { explanation: event.target.value })
                    }
                    rows={4}
                    placeholder="How does this image strategy help Douglass control his story?"
                    className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base text-kid-ink outline-none ring-kid-purple/30 placeholder:text-zinc-400 focus:ring-2"
                  />
                </div>

                <div>
                  <Label htmlFor={`${post.postKey}-caption`} className="text-kid-ink">
                    Add your own modern caption or hashtag.{" "}
                    <span className="font-normal text-kid-ink-muted">(optional)</span>
                  </Label>
                  <textarea
                    id={`${post.postKey}-caption`}
                    value={postDraft.modernCaption}
                    onChange={(event) =>
                      updatePost(post.postKey, { modernCaption: event.target.value })
                    }
                    rows={2}
                    placeholder="#FreedomVoice #OwnYourStory"
                    className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base text-kid-ink outline-none ring-kid-purple/30 placeholder:text-zinc-400 focus:ring-2"
                  />
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="space-y-3">
        <p className="text-sm font-black text-kid-ink">Profile grid preview</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {DOUGLASS_PROFILE_POSTS.map((post) => {
            const postDraft = draft.posts[post.postKey];
            const strategy = postDraft.imageStrategy;
            const gradientClass = strategy
              ? STRATEGY_PLACEHOLDER_STYLES[strategy]
              : "from-zinc-300 via-zinc-200 to-zinc-300";

            return (
              <div
                key={`preview-${post.postKey}`}
                className="overflow-hidden rounded-2xl border-2 border-kid-purple/20 bg-white shadow-sm"
              >
                <div
                  className={cn(
                    "flex aspect-square items-center justify-center bg-gradient-to-br p-3 text-center",
                    gradientClass,
                  )}
                >
                  <p className="text-xs font-black uppercase tracking-wide text-white/90">
                    {strategy || "Pick image strategy"}
                  </p>
                </div>
                <div className="p-3">
                  <p className="text-sm font-black text-kid-ink">{post.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-kid-ink-muted">
                    &ldquo;{post.captionQuote}&rdquo;
                  </p>
                  {postDraft.modernCaption.trim() ? (
                    <p className="mt-2 text-xs font-semibold text-violet-700">
                      {postDraft.modernCaption.trim()}
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="button" variant="reward" fullWidth onClick={handleSave}>
          Save Profile Draft
        </Button>
        <Button type="button" variant="neutral" fullWidth onClick={handleClear}>
          Clear Draft
        </Button>
      </div>

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
    </div>
  );
}
