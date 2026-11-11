import type { ComponentProps } from 'react';
import type { AddBookState, CatalogueWork } from '@/entities/book/types';
import { paths } from '@/shared/config/paths';
import { isPlainClick } from '@/shared/lib/plainClick';
import { TransitionLink } from '@/shared/ui/TransitionLink';
import { leaveForBook } from './leaveForBook';

// A way into a book's page from the shelves (a card, a row, a found one):
// its cover, inside, flies over to the page. For a book from the catalogue
// (`work`, kept in a list, say), its page from there, there at once.
export function BookLink({
  id,
  work,
  ...props
}: { id: string; work?: CatalogueWork } & Omit<
  ComponentProps<typeof TransitionLink>,
  'to'
>) {
  return (
    <TransitionLink
      to={work ? paths.work(work.workKey) : paths.book(id)}
      state={work ? ({ work } satisfies AddBookState) : undefined}
      onClick={(e) => isPlainClick(e) && leaveForBook(id, e.currentTarget)}
      {...props}
    />
  );
}
