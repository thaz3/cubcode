"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ReadingListBookCard } from "@/components/liberation-lab/reading-list-book-card";
import { Button } from "@/components/ui/button";
import {
  frederickDouglassReadingList,
  READING_LIST_CATEGORIES,
  type FrederickDouglassReadingBook,
  type ReadingListCategory,
} from "@/lib/liberation-lab/frederick-douglass-reading-list";
import {
  readSelectedReadingBook,
  writeSelectedReadingBook,
  type SelectedReadingBook,
} from "@/lib/liberation-lab/selected-reading-book-storage";
import { cn } from "@/lib/utils";

const ALL_CATEGORIES_LABEL = "All categories";

type FrederickDouglassReadingListBrowserProps = {
  cubId: string;
  deckSlug: string;
  partKey: string;
};

export function FrederickDouglassReadingListBrowser({
  cubId,
  deckSlug,
  partKey,
}: FrederickDouglassReadingListBrowserProps) {
  const [activeCategory, setActiveCategory] = useState<ReadingListCategory | "all">("all");
  const [selectedBook, setSelectedBook] = useState<SelectedReadingBook | null>(null);
  const [pickMessage, setPickMessage] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const worksheetHref = `/cub/${cubId}/training/deck/${deckSlug}/part/${partKey}/worksheet#books-are-power-worksheet`;

  useEffect(() => {
    setSelectedBook(readSelectedReadingBook(cubId, deckSlug));
    setHydrated(true);
  }, [cubId, deckSlug]);

  const filteredBooks = useMemo(() => {
    if (activeCategory === "all") return frederickDouglassReadingList;
    return frederickDouglassReadingList.filter((book) => book.category === activeCategory);
  }, [activeCategory]);

  function handlePickBook(book: FrederickDouglassReadingBook) {
    const selection: SelectedReadingBook = {
      title: book.title,
      author: book.author,
      category: book.category,
      slug: book.slug,
    };

    writeSelectedReadingBook(cubId, deckSlug, selection);
    setSelectedBook(selection);
    setPickMessage("Book selected. Return to your worksheet to continue.");
  }

  if (!hydrated) {
    return <p className="text-sm text-kid-ink-muted">Loading reading list…</p>;
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border-2 border-kid-purple/25 bg-white/90 px-4 py-4 shadow-sm">
        <p className="text-sm leading-relaxed text-kid-ink">
          Frederick Douglass believed reading could open the path to freedom. Pick one book from
          the list below and bring that choice back to your worksheet.
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-wide text-kid-ink-muted">
          Filter by category
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={cn(
              "min-h-11 touch-manipulation rounded-full border-2 px-3 py-2 text-xs font-bold transition",
              activeCategory === "all"
                ? "border-kid-purple bg-kid-purple text-white"
                : "border-kid-purple/25 bg-white text-kid-ink hover:border-kid-purple/50",
            )}
          >
            {ALL_CATEGORIES_LABEL}
          </button>
          {READING_LIST_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={cn(
                "min-h-11 touch-manipulation rounded-full border-2 px-3 py-2 text-xs font-bold transition",
                activeCategory === category
                  ? "border-kid-purple bg-kid-purple text-white"
                  : "border-kid-purple/25 bg-white text-kid-ink hover:border-kid-purple/50",
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm font-semibold text-kid-ink-muted">
        {filteredBooks.length} book{filteredBooks.length === 1 ? "" : "s"}
        {activeCategory === "all" ? "" : ` in ${activeCategory}`}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredBooks.map((book) => (
          <ReadingListBookCard
            key={book.slug}
            book={book}
            isSelected={selectedBook?.slug === book.slug}
            onPick={handlePickBook}
          />
        ))}
      </div>

      {pickMessage ? (
        <div className="rounded-2xl border-2 border-emerald-400/50 bg-emerald-50 px-4 py-4 shadow-sm">
          <p className="text-sm font-semibold text-emerald-800">{pickMessage}</p>
          {selectedBook ? (
            <p className="mt-2 text-sm text-emerald-900">
              Selected book:{" "}
              <span className="font-bold">
                {selectedBook.title} by {selectedBook.author}
              </span>
            </p>
          ) : null}
          <Link href={worksheetHref} className="mt-4 block">
            <Button type="button" variant="constructive" fullWidth className="font-bold">
              Back to worksheet
            </Button>
          </Link>
        </div>
      ) : null}
    </div>
  );
}
