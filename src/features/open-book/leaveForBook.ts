import { flyCoverOf } from '@/shared/lib/coverFlight';
import { forgetSearch } from './useShelfSearch';

// Opening a book from the shelves: its cover flies over to the book's
// page, and coming back shows the whole shelf, not the search it was
// found by. `from`: what was clicked, holding the cover that flies.
export function leaveForBook(id: string, from?: Element | null) {
  forgetSearch();
  flyCoverOf(id, from?.querySelector('[data-cover-of]'));
}
