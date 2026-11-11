import { useAverageRatings } from '@/entities/book/averageRatings';
import type { Book } from '@/entities/book/types';
import { madeListOrders, orders, ordered, ordersFor, usual } from './order';
import { useShelfOrder } from './useShelfOrder';

// Each kind's ways of ordering, and where the one chosen is remembered
const kinds = {
  own: { key: 'alcove.list-order', orders },
  made: { key: 'alcove.made-list-order', orders: madeListOrders },
  reader: { key: 'alcove.reader-books-order', orders },
};

// How a list's `books` are ordered, as the shelves' are (useShelfOrder),
// remembered for every list in this browser: the reader's own lists out
// of every way, those someone else made (`made`) by the order they put
// them in rather than when, and another reader's books (`reader`) as the
// reader's own lists are, each kept apart. Only the ways the books say
// anything for are offered (none rated, no ordering by rating), the books
// knowing how readers at large rate them as the catalogue tells it
// (useAverageRatings); one chosen for another list that isn't, the usual
// (the averages still on their way, still that one, rather than another
// till they come).
export function useListOrder(books: Book[], kind: keyof typeof kinds = 'own') {
  const { key, orders: every } = kinds[kind];
  const { books: known, ready } = useAverageRatings(books);
  const options = ordersFor(every, known);
  const order = useShelfOrder(false, key, every);
  const chosen = order.arrangement.order;
  const offered =
    options.some((o) => o.value === chosen) || (chosen === 'average' && !ready);
  const arrangement = offered
    ? order.arrangement
    : { ...order.arrangement, order: usual.order, reversed: usual.reversed };
  const byId = new Map(known.map((book) => [book.id, book]));
  return {
    menu: { arrangement, orders: options, onOrder: order.setOrder },
    // Those of them shown (found, say), in order
    sort: (shown: Book[]) =>
      ordered(
        shown.map((book) => byId.get(book.id) ?? book),
        arrangement.order,
        arrangement.reversed,
      ),
  };
}
