import { useState } from 'react';
import { bookMatches } from '@/entities/book/matches';
import type { Book } from '@/entities/book/types';

// Looking for a book in a list by its title or writer: what's typed, and
// of `items` those whose book (`bookOf`) matches it, all while nothing is
export function useListSearch<T>(items: T[], bookOf: (item: T) => Book) {
  const [query, setQuery] = useState('');
  const asked = query.trim();
  return {
    query,
    setQuery,
    asked: Boolean(asked),
    found: asked
      ? items.filter((item) => bookMatches(bookOf(item), asked))
      : items,
  };
}
