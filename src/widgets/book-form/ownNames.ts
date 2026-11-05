import { useMemo } from 'react';
import { searchable } from '@/entities/book/matches';
import { useBooks } from '@/entities/book/queries';
import { useShelf } from '@/entities/book/useShelf';
import type { Book } from '@/entities/book/types';

// Names the reader gives their books (their writers, their own genres),
// counted over the whole shelf, to offer back to them as they fill in a
// book's details

// How many of their books each name is on, by the ways it's written:
// one name for any capitals, the first way it was written first
function useShelfNames(namesOf: (book: Book) => string[] | undefined) {
  const shelf = useShelf(useBooks(), '', true);
  return useMemo(() => {
    const counts = new Map<string, Map<string, number>>();
    for (const book of shelf.all)
      for (const written of namesOf(book) ?? []) {
        const name = written.trim();
        const key = name.toLowerCase();
        if (!key) continue;
        const ways = counts.get(key) ?? new Map<string, number>();
        ways.set(name, (ways.get(name) ?? 0) + 1);
        counts.set(key, ways);
      }
    return counts;
  }, [shelf.all, namesOf]);
}

// How many books a name's ways of being written come to
const total = (ways: Map<string, number>) =>
  [...ways.values()].reduce((sum, n) => sum + n, 0);

const authorsOf = (book: Book) => book.authors;
const genresOf = (book: Book) => book.genres;

// The writers of the reader's books, those with the most books first, each
// as written the first time
export function useOwnAuthors() {
  const counts = useShelfNames(authorsOf);
  return useMemo(
    () =>
      [...counts.values()]
        .map((ways) => ({ name: [...ways.keys()][0], books: total(ways) }))
        .sort((a, b) => b.books - a.books || a.name.localeCompare(b.name))
        .map((each) => each.name),
    [counts],
  );
}

// The most of the reader's own genres offered, and how many of their
// books one must be on to be offered at all
const OFFERED = 10;
const OFTEN = 2;

const capital = (name: string) => (name[0] === name[0].toUpperCase() ? 1 : 0);

// The genres the reader gives their books themselves, beyond those always
// offered (`common`): those on a few of their books, the commonest first,
// each as it's written most often (with a capital, between two as often)
export function useOwnGenres(common: string[]) {
  const counts = useShelfNames(genresOf);
  return useMemo(() => {
    const usual = new Set(common.map((genre) => genre.toLowerCase()));
    return [...counts]
      .filter(([key]) => !usual.has(key))
      .map(([, ways]) => {
        const [[name]] = [...ways].sort(
          ([a, x], [b, y]) => y - x || capital(b) - capital(a),
        );
        return { name, books: total(ways) };
      })
      .filter((each) => each.books >= OFTEN)
      .sort((a, b) => b.books - a.books || a.name.localeCompare(b.name))
      .slice(0, OFFERED)
      .map((each) => each.name);
  }, [counts, common]);
}

// Of `names`, those `typed` could be the start of (the whole name, or one
// of its words), but not one written out already, here or among `taken`;
// compared as search compares (searchable)
export function startingWith(names: string[], typed: string, taken: string[]) {
  const start = searchable(typed.trim());
  if (start.length < 2) return [];
  const used = new Set(taken.map(searchable));
  return names.filter((name) => {
    const whole = searchable(name);
    return (
      whole !== start &&
      !used.has(whole) &&
      (whole.startsWith(start) ||
        whole.split(/[\s.-]+/).some((word) => word.startsWith(start)))
    );
  });
}
