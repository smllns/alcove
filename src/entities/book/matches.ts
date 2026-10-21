import type { Book } from './types';

// Text as search compares it: lower case and without accents, so "exupery"
// finds Exupéry and "ежик" finds Ёжик. Й is a letter of its own, not an и
// with a mark, so it's kept.
const searchable = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^й]+/g, (part) => part.normalize('NFD').replace(/\p{M}/gu, ''));

// Everything about a book a search looks in, run together. Worked out once
// per book, not on every keystroke.
const haystacks = new WeakMap<Book, string>();
const haystack = (book: Book) => {
  const known = haystacks.get(book);
  if (known !== undefined) return known;
  const text = searchable(
    [
      book.title,
      book.subtitle,
      ...book.authors,
      book.originalTitle,
      ...(book.translators ?? []),
      book.series?.name,
      book.isbn,
    ]
      .filter(Boolean)
      .join(' \u0000 '),
  );
  haystacks.set(book, text);
  return text;
};

// Whether every word of `query` turns up somewhere in the book (its title,
// authors, series…), in any order: "tartt secret" finds The Secret History
export function bookMatches(book: Book, query: string) {
  const words = searchable(query).split(/\s+/).filter(Boolean);
  const text = haystack(book);
  return words.every((word) => text.includes(word));
}
