import { useLocation, useNavigate } from 'react-router';
import type { AddBookState } from '@/entities/book/types';
import { paths } from '@/shared/config/paths';
import { useTransitionNavigate } from '@/shared/lib/useTransitionNavigate';
import { Notice } from '@/shared/ui/Notice';

// Before adding a book the reader has already: said at once, with a way
// to the copy on their shelves; carrying on adds a second one. Gone to
// see it, coming back opens this book to add again, not the search: the
// page left is remembered with it chosen (`chosen`).
export function AlreadyShelved({
  bookId,
  chosen,
}: {
  bookId: string;
  chosen: AddBookState;
}) {
  const { pathname } = useLocation();
  const remember = useNavigate();
  const navigate = useTransitionNavigate();
  const see = () => {
    remember(pathname, { replace: true, state: chosen });
    void navigate(paths.book(bookId), 'forward');
  };
  return (
    <div className='mb-8 animate-fade-in'>
      <Notice
        title='This book is already on your shelves.'
        action='See your copy'
        onAction={see}
      >
        Sure you want to add it again? Carry on, and it’s added as a second
        copy.
      </Notice>
    </div>
  );
}
