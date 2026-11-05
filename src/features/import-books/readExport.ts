import { csvRecords } from '@/shared/lib/csv';
import { fromGoodreads, isGoodreads } from './goodreads';
import type { Imported } from './imported';
import { fromStoryGraph, isStoryGraph } from './storygraph';

export type Source = 'Goodreads' | 'StoryGraph';

// Each site whose export can be read: how its columns tell it, and how a
// row of it is read
const sites: {
  source: Source;
  is: (columns: string[]) => boolean;
  from: (row: Record<string, string>) => Imported;
}[] = [
  { source: 'Goodreads', is: isGoodreads, from: fromGoodreads },
  { source: 'StoryGraph', is: isStoryGraph, from: fromStoryGraph },
];

// An exported library, read: whose it is, and its books (those with a
// title and a writer), in the order they were added there, the earliest
// first, so they come over in it; null for a file that's neither site's
export function readExport(text: string) {
  const rows = csvRecords(text);
  const columns = Object.keys(rows[0] ?? {});
  const site = sites.find(({ is }) => is(columns));
  if (!site) return null;
  const books = rows
    .map(site.from)
    .filter(({ book }) => book.title && book.authors.length)
    .sort((a, b) => (a.added ?? '').localeCompare(b.added ?? ''));
  return { source: site.source, books };
}
