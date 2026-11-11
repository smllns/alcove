import { useQuery } from '@tanstack/react-query';
import { fetchSharedBooksBy } from './authorApi';
import { titleKey } from './matches';
import type { CatalogueWork, SimilarBook } from './types';
import { sameWriter } from './writers';

// A writer's books as alcove's other readers have them, for one the
// catalogue knows little or nothing of (users/sharedBooks.ts on the
// server), and those added to the catalogue's own

export const useSharedBooksBy = (name: string | undefined) =>
  useQuery({
    queryKey: ['shared-books-by', name ?? ''],
    queryFn: () => fetchSharedBooksBy(name!),
    enabled: Boolean(name),
    staleTime: 5 * 60 * 1000,
  });

// The catalogue's books of a writer, and after them those only readers
// have: by the writer (`names`, however they're written: the reader's way,
// the catalogue's), not one of the catalogue's already (by its work or its
// title)
export function withShared(
  works: SimilarBook[],
  shared: CatalogueWork[],
  names: string[],
): SimilarBook[] {
  const keys = new Set(works.map((work) => work.workKey));
  const titles = new Set(works.map((work) => titleKey(work.title)));
  const theirs = shared.filter(
    (work) =>
      !keys.has(work.workKey) &&
      !titles.has(titleKey(work.title)) &&
      work.authors.some((author) =>
        names.some((name) => sameWriter(author, name)),
      ),
  );
  return [...works, ...theirs];
}
