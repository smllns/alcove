import { useEffect } from 'react';
import { copyCatalogueCovers } from './api';
import type { Book } from './types';

// One run at a time, however many times the library is opened
let running = false;

// While any of `books` still shows its cover straight from the catalogue
// (slow to load), asks the server to keep copies, a few at a time, until
// none are left. The copies show from the next visit on: swapping covers
// on screen would only make them flicker.
export function useCoverCopies(books: Book[]) {
  const waiting = books.some(
    (book) => book.cover?.source === 'openlibrary' && !book.cover.uncopied,
  );

  useEffect(() => {
    if (!waiting || running) return;
    running = true;
    void (async () => {
      try {
        for (let round = 0; round < 200; round++) {
          const { remaining } = await copyCatalogueCovers();
          if (!remaining) break;
        }
      } catch {
        // Not now; the covers still show, and the next visit tries again
      } finally {
        running = false;
      }
    })();
  }, [waiting]);
}
