import { useWorkTitles } from './authorQueries';
import { copiesOf, inTheirTime, oneWorkEach } from './theirWorks';
import type { Book, SimilarBook } from './types';

// The catalogue's books of a writer's (`works`, only those of their time,
// inTheirTime, by `born` and `died`) told apart from the reader's own
// (`theirs`), once both are in (`ready`): by key, by title, and by every
// title each of the reader's books has in other languages, from Wikidata
// (useWorkTitles, asked only when there are works to tell them by), since
// the catalogue keeps a translation apart, as a book of its own; the
// original and its translations then go as one (oneWorkEach). Till the
// titles are in, it's not `matched`, and what depends on it waits, so no
// book moves from one part of the page to another: those the reader
// hasn't (`unread`, the most read first) are none till then.
export function useMatchedWorks(
  theirs: Book[],
  found: SimilarBook[],
  ready: boolean,
  born?: number,
  died?: number,
) {
  const works = inTheirTime(found, born, died);
  const { titles, known } = useWorkTitles(ready && works.length ? theirs : []);
  const copyOf = copiesOf(theirs, works, titles);
  const each = oneWorkEach(works, copyOf);
  const matched = ready && known;
  return {
    matched,
    // One to each of the reader's books, and how each is theirs
    works: each,
    copyOf,
    unread: matched ? each.filter((work) => !copyOf(work).bookId) : [],
  };
}
