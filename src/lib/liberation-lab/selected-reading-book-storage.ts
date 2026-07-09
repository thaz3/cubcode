export type SelectedReadingBook = {
  title: string;
  author: string;
  category: string;
  slug: string;
};

export function selectedReadingBookStorageKey(cubId: string, deckSlug: string) {
  return `liblab:${cubId}:${deckSlug}:selected-reading-book`;
}

export function readSelectedReadingBook(
  cubId: string,
  deckSlug: string,
): SelectedReadingBook | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(selectedReadingBookStorageKey(cubId, deckSlug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SelectedReadingBook>;
    if (!parsed.title?.trim() || !parsed.author?.trim() || !parsed.slug?.trim()) {
      return null;
    }
    return {
      title: parsed.title.trim(),
      author: parsed.author.trim(),
      category: String(parsed.category ?? "").trim(),
      slug: parsed.slug.trim(),
    };
  } catch {
    return null;
  }
}

export function writeSelectedReadingBook(
  cubId: string,
  deckSlug: string,
  book: SelectedReadingBook,
) {
  localStorage.setItem(selectedReadingBookStorageKey(cubId, deckSlug), JSON.stringify(book));
}

export function clearSelectedReadingBook(cubId: string, deckSlug: string) {
  localStorage.removeItem(selectedReadingBookStorageKey(cubId, deckSlug));
}
