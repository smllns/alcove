import type { ComponentProps } from 'react';
import { paths } from '@/shared/config/paths';
import { isPlainClick } from '@/shared/lib/plainClick';
import { TransitionLink } from '@/shared/ui/TransitionLink';
import { leaveForBook } from './leaveForBook';

// A way into a book's page from the shelves (a card, a row, a found one):
// its cover, inside, flies over to the page
export function BookLink({
  id,
  ...props
}: { id: string } & Omit<ComponentProps<typeof TransitionLink>, 'to'>) {
  return (
    <TransitionLink
      to={paths.book(id)}
      onClick={(e) => isPlainClick(e) && leaveForBook(id, e.currentTarget)}
      {...props}
    />
  );
}
