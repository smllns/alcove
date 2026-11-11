import { catalogueBook } from '@/entities/book/catalogueBook';
import type { Book, CatalogueWork } from '@/entities/book/types';
import { useListOrder } from './useListOrder';

// Works (a list's, another reader's books) ordered as books are
// (useListOrder, of its `kind`): each as the catalogue's book, the
// reader's own copy of it (`owned`, by work) giving their stars; those
// shown handed back as works, each with how readers at large rate it, as
// far as that's known
export function useWorkOrder(
  works: CatalogueWork[],
  owned: Map<string, Book>,
  kind: Parameters<typeof useListOrder>[1],
) {
  const order = useListOrder(
    works.map((work) => ({
      ...catalogueBook(work),
      copy: owned.get(work.workKey)?.copy,
    })),
    kind,
  );
  return {
    menu: order.menu,
    sort: (shown: CatalogueWork[]) => {
      const byId = new Map(shown.map((work) => [catalogueBook(work).id, work]));
      return order.sort(shown.map(catalogueBook)).map((book) => ({
        ...byId.get(book.id)!,
        averageRating: book.averageRating,
      }));
    },
  };
}
