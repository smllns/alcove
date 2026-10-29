import { cached } from './cache.js';
import { cleanDescription } from './description.js';
import { genresOf } from './genres.js';
import { fromOpenLibrary } from './openLibrary.js';

// A work as the catalogue keeps it: what several lookups about one book
// (what it's about, who wrote it, books like it) all start from
type WorkDoc = {
  title?: string;
  description?: string | { value?: string };
  subjects?: string[];
  authors?: { author?: { key?: string } }[];
};

// Asked of the catalogue once, then kept for all of them
export const workDoc = (workKey: string) =>
  cached(`work1:${workKey}`, 30, () =>
    fromOpenLibrary<WorkDoc>(`/works/${workKey}.json`),
  );

// The key of a work's first author, if it names one
export const firstAuthor = (work: WorkDoc) =>
  work.authors?.[0]?.author?.key?.replace('/authors/', '');

// What the book is about, if the catalogue says, and the genres its
// subjects point to
export async function workDetails(workKey: string) {
  const { description, subjects } = await workDoc(workKey);
  return {
    description:
      cleanDescription(
        typeof description === 'string' ? description : description?.value,
      ) ?? null,
    genres: genresOf(subjects),
  };
}

type RatingsDoc = { summary?: { average?: number | null; count?: number } };

// How the catalogue's readers rate the book: the average out of five and
// how many rated it; none when nobody has
export async function workRatings(workKey: string) {
  const { summary } = await fromOpenLibrary<RatingsDoc>(
    `/works/${workKey}/ratings.json`,
  );
  return summary?.average && summary.count
    ? { average: Math.round(summary.average * 10) / 10, count: summary.count }
    : null;
}
