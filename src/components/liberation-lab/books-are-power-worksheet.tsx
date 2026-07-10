"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OTHER_READING_CHOICE } from "@/lib/liberation-lab/frederick-douglass-reading-list";
import {
  clearSelectedReadingBook,
  readSelectedReadingBook,
  type SelectedReadingBook,
} from "@/lib/liberation-lab/selected-reading-book-storage";
import { cn } from "@/lib/utils";

export const BOOKS_ARE_POWER_WORKSHEET_INTRO = [
  "Frederick Douglass was born into a world that tried to keep him powerless, but he discovered something that changed his life forever: words have power. When Douglass learned to read, he gained more than letters on a page — he gained knowledge, courage, and a clearer vision of freedom. Reading helped him understand the world around him, speak against injustice, and become one of the most powerful voices in American history. In this lesson, you will choose a book from the Frederick Douglass reading list and begin your own journey into the power of words, truth, and freedom.",
  "He said that reading is the path to freedom and being able to read makes a man unfit for slavery. He continued to teach himself and learn new things throughout his entire life. He had a library built in Washington DC to hold close to 2000 books. If you met Frederick Douglass today he would probably ask about what you like to read. Answer the questions below:",
] as const;

export type BooksArePowerWorksheetDraft = {
  favoriteBookTitle: string;
  favoriteBookAuthor: string;
  whyLikeFavoriteBook: string;
  lastLibraryVisit: string;
  readingChoiceMode: "list" | "other" | "";
  customBookTitle: string;
  customBookAuthor: string;
};

const EMPTY_DRAFT: BooksArePowerWorksheetDraft = {
  favoriteBookTitle: "",
  favoriteBookAuthor: "",
  whyLikeFavoriteBook: "",
  lastLibraryVisit: "",
  readingChoiceMode: "",
  customBookTitle: "",
  customBookAuthor: "",
};

const TOTAL_QUESTIONS = 5;

function storageKey(cubId: string) {
  return `cub:liberation-lab:books-are-power:${cubId}`;
}

function normalizeLoadedDraft(raw: Record<string, unknown>): BooksArePowerWorksheetDraft {
  const readingChoiceMode =
    raw.readingChoiceMode === "list" || raw.readingChoiceMode === "other"
      ? raw.readingChoiceMode
      : raw.customBookTitle || raw.customBookAuthor
        ? "other"
        : "";

  return {
    favoriteBookTitle: String(raw.favoriteBookTitle ?? raw.q1 ?? ""),
    favoriteBookAuthor: String(raw.favoriteBookAuthor ?? raw.q2 ?? ""),
    whyLikeFavoriteBook: String(raw.whyLikeFavoriteBook ?? raw.q3 ?? ""),
    lastLibraryVisit: String(raw.lastLibraryVisit ?? raw.q4 ?? ""),
    readingChoiceMode,
    customBookTitle: String(raw.customBookTitle ?? ""),
    customBookAuthor: String(raw.customBookAuthor ?? ""),
  };
}

function isQuestionFiveComplete(
  draft: BooksArePowerWorksheetDraft,
  selectedBook: SelectedReadingBook | null,
): boolean {
  if (draft.readingChoiceMode === "other") {
    return Boolean(draft.customBookTitle.trim() && draft.customBookAuthor.trim());
  }
  return selectedBook !== null;
}

function countCompletedQuestions(
  draft: BooksArePowerWorksheetDraft,
  selectedBook: SelectedReadingBook | null,
): number {
  let count = 0;
  if (draft.favoriteBookTitle.trim()) count += 1;
  if (draft.favoriteBookAuthor.trim()) count += 1;
  if (draft.whyLikeFavoriteBook.trim()) count += 1;
  if (draft.lastLibraryVisit.trim()) count += 1;
  if (isQuestionFiveComplete(draft, selectedBook)) count += 1;
  return count;
}

type BooksArePowerWorksheetProps = {
  cubId: string;
  deckSlug: string;
};

export function BooksArePowerWorksheet({ cubId, deckSlug }: BooksArePowerWorksheetProps) {
  const [draft, setDraft] = useState<BooksArePowerWorksheetDraft>(EMPTY_DRAFT);
  const [selectedBook, setSelectedBook] = useState<SelectedReadingBook | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const readingListHref = `/cub/${cubId}/training/deck/${deckSlug}/reading-list`;

  const refreshSelectedBook = useCallback(() => {
    const book = readSelectedReadingBook(cubId, deckSlug);
    setSelectedBook(book);
    if (book) {
      setDraft((current) => ({
        ...current,
        readingChoiceMode: "list",
        customBookTitle: "",
        customBookAuthor: "",
      }));
    }
  }, [cubId, deckSlug]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(cubId));
      if (raw) {
        setDraft(normalizeLoadedDraft(JSON.parse(raw) as Record<string, unknown>));
      }
    } catch {
      setDraft(EMPTY_DRAFT);
    }

    refreshSelectedBook();
    setHydrated(true);
  }, [cubId, refreshSelectedBook]);

  useEffect(() => {
    if (!hydrated) return;

    function handleFocus() {
      refreshSelectedBook();
    }

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [hydrated, refreshSelectedBook]);

  const updateDraft = useCallback((patch: Partial<BooksArePowerWorksheetDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setSaveMessage(null);
  }, []);

  const completedCount = countCompletedQuestions(draft, selectedBook);

  function handleSave() {
    try {
      localStorage.setItem(storageKey(cubId), JSON.stringify(draft));
      setSaveMessage("Worksheet saved on this device.");
    } catch {
      setSaveMessage("Could not save your draft. Try again.");
    }
  }

  function handleClear() {
    localStorage.removeItem(storageKey(cubId));
    clearSelectedReadingBook(cubId, deckSlug);
    setDraft(EMPTY_DRAFT);
    setSelectedBook(null);
    setSaveMessage("Draft cleared.");
  }

  function handleUseOtherChoice() {
    clearSelectedReadingBook(cubId, deckSlug);
    setSelectedBook(null);
    updateDraft({ readingChoiceMode: "other" });
  }

  function handleUseReadingList() {
    updateDraft({
      readingChoiceMode: "list",
      customBookTitle: "",
      customBookAuthor: "",
    });
  }

  if (!hydrated) {
    return <p className="text-sm text-kid-ink-muted">Loading your worksheet draft…</p>;
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border-2 border-kid-purple/25 bg-white/90 px-4 py-4 shadow-sm">
        <div className="space-y-3 text-sm leading-relaxed text-kid-ink">
          {BOOKS_ARE_POWER_WORKSHEET_INTRO.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border-2 border-kid-purple/25 bg-white/90 px-4 py-3 shadow-sm">
        <p className="text-sm font-black text-kid-ink">
          Progress: {completedCount} of {TOTAL_QUESTIONS} questions complete
        </p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-kid-lavender/60">
          <div
            className="h-full rounded-full bg-gradient-to-r from-kid-purple to-kid-blue transition-all"
            style={{ width: `${(completedCount / TOTAL_QUESTIONS) * 100}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-kid-ink-muted">
          Your answers save on this device when you tap Save Worksheet.
        </p>
      </div>

      <div className="rounded-2xl border-2 border-kid-purple/20 bg-white/95 p-4 shadow-sm">
        <Label htmlFor="favoriteBookTitle" className="font-bold text-kid-ink">
          What is the name of your favorite book?
        </Label>
        <Input
          id="favoriteBookTitle"
          value={draft.favoriteBookTitle}
          onChange={(event) => updateDraft({ favoriteBookTitle: event.target.value })}
          placeholder="Enter the title of your favorite book"
          className="mt-2 border-zinc-300 bg-white text-kid-ink"
        />
      </div>

      <div className="rounded-2xl border-2 border-kid-purple/20 bg-white/95 p-4 shadow-sm">
        <Label htmlFor="favoriteBookAuthor" className="font-bold text-kid-ink">
          Who is the author?
        </Label>
        <Input
          id="favoriteBookAuthor"
          value={draft.favoriteBookAuthor}
          onChange={(event) => updateDraft({ favoriteBookAuthor: event.target.value })}
          placeholder="Enter the author’s name"
          className="mt-2 border-zinc-300 bg-white text-kid-ink"
        />
      </div>

      <div className="rounded-2xl border-2 border-kid-purple/20 bg-white/95 p-4 shadow-sm">
        <Label htmlFor="whyLikeFavoriteBook" className="font-bold text-kid-ink">
          Why do you like this book?
        </Label>
        <textarea
          id="whyLikeFavoriteBook"
          value={draft.whyLikeFavoriteBook}
          onChange={(event) => updateDraft({ whyLikeFavoriteBook: event.target.value })}
          placeholder="Tell Frederick Douglass what makes this book special to you."
          rows={4}
          className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base text-kid-ink outline-none ring-kid-purple/30 placeholder:text-zinc-400 focus:ring-2"
        />
      </div>

      <div className="rounded-2xl border-2 border-kid-purple/20 bg-white/95 p-4 shadow-sm">
        <Label htmlFor="lastLibraryVisit" className="font-bold text-kid-ink">
          When was the last time you visited the library or bookstore near your home?
        </Label>
        <Input
          id="lastLibraryVisit"
          value={draft.lastLibraryVisit}
          onChange={(event) => updateDraft({ lastLibraryVisit: event.target.value })}
          placeholder="e.g. Last Saturday, or the name of the place you visited"
          className="mt-2 border-zinc-300 bg-white text-kid-ink"
        />
      </div>

      <div
        id="books-are-power-worksheet"
        className="rounded-2xl border-2 border-amber-400/35 bg-gradient-to-br from-amber-50 via-white to-kid-cream p-4 shadow-sm scroll-mt-24"
      >
        <Label className="font-bold text-kid-ink">What book did you pick from the reading list?</Label>

        <div className="mt-4 space-y-4">
          <Link href={readingListHref} className="block">
            <Button type="button" variant="reward" fullWidth className="font-bold">
              Browse Reading List
            </Button>
          </Link>

          {selectedBook && draft.readingChoiceMode !== "other" ? (
            <div className="rounded-xl border border-emerald-300/60 bg-emerald-50/80 px-4 py-3">
              <p className="text-sm text-kid-ink">
                Selected book:{" "}
                <span className="font-bold">
                  {selectedBook.title} by {selectedBook.author}
                </span>
              </p>
            </div>
          ) : null}

          {!selectedBook && draft.readingChoiceMode !== "other" ? (
            <p className="text-sm text-kid-ink-muted">
              No book selected yet. Tap Browse Reading List to pick one.
            </p>
          ) : null}

          <div className="border-t border-amber-200/80 pt-4">
            {draft.readingChoiceMode !== "other" ? (
              <button
                type="button"
                onClick={handleUseOtherChoice}
                className="text-sm font-bold text-kid-purple underline underline-offset-2"
              >
                {OTHER_READING_CHOICE}
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold text-kid-ink">{OTHER_READING_CHOICE}</p>
                  <button
                    type="button"
                    onClick={handleUseReadingList}
                    className="text-xs font-bold text-kid-purple underline underline-offset-2"
                  >
                    Pick from reading list instead
                  </button>
                </div>
                <div>
                  <Label htmlFor="customBookTitle" className="text-kid-ink">
                    Book title
                  </Label>
                  <Input
                    id="customBookTitle"
                    value={draft.customBookTitle}
                    onChange={(event) => updateDraft({ customBookTitle: event.target.value })}
                    placeholder="Enter your book title"
                    className="mt-2 border-zinc-300 bg-white text-kid-ink"
                  />
                </div>
                <div>
                  <Label htmlFor="customBookAuthor" className="text-kid-ink">
                    Author
                  </Label>
                  <Input
                    id="customBookAuthor"
                    value={draft.customBookAuthor}
                    onChange={(event) => updateDraft({ customBookAuthor: event.target.value })}
                    placeholder="Enter the author’s name"
                    className="mt-2 border-zinc-300 bg-white text-kid-ink"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="button" variant="reward" fullWidth onClick={handleSave}>
          Save Worksheet
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
