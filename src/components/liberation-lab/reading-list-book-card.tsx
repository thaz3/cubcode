"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { FrederickDouglassReadingBook } from "@/lib/liberation-lab/frederick-douglass-reading-list";
import { cn } from "@/lib/utils";

type ReadingListBookCardProps = {
  book: FrederickDouglassReadingBook;
  isSelected: boolean;
  onPick: (book: FrederickDouglassReadingBook) => void;
};

function BookCoverPlaceholder({ title }: { title: string }) {
  const initials = title
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div
      className="flex aspect-[3/4] w-full items-center justify-center rounded-xl border-2 border-amber-300/40 bg-gradient-to-br from-amber-100 via-kid-cream to-kid-lavender/80"
      aria-hidden
    >
      <div className="text-center px-3">
        <span className="text-3xl" aria-hidden>
          📖
        </span>
        <p className="mt-2 text-lg font-black text-kid-purple">{initials || "?"}</p>
      </div>
    </div>
  );
}

export function ReadingListBookCard({ book, isSelected, onPick }: ReadingListBookCardProps) {
  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-2xl border-2 bg-white/95 shadow-sm transition",
        isSelected
          ? "border-emerald-500 ring-2 ring-emerald-400/40"
          : "border-kid-purple/20 hover:border-kid-purple/40",
      )}
    >
      <div className="p-3 pb-0">
        {book.coverUrl ? (
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
            <Image
              src={book.coverUrl}
              alt={`Cover of ${book.title}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>
        ) : (
          <BookCoverPlaceholder title={book.title} />
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 pt-3">
        <p className="text-[10px] font-bold uppercase tracking-wide text-kid-purple">
          {book.category}
        </p>
        <h3 className="mt-1 text-base font-black leading-snug text-kid-ink">{book.title}</h3>
        <p className="mt-1 text-sm font-medium text-kid-ink-muted">by {book.author}</p>
        <p className="mt-2 text-xs font-semibold text-kid-ink-soft">{book.ageRange}</p>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-kid-ink-muted">{book.whyRead}</p>

        <Button
          type="button"
          variant={isSelected ? "constructive" : "reward"}
          fullWidth
          className="mt-4 font-bold"
          onClick={() => onPick(book)}
        >
          {isSelected ? "Selected ✓" : "Pick this book"}
        </Button>
      </div>
    </article>
  );
}
