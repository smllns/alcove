import { useParams } from 'react-router';
import { useBook } from '@/entities/book/queries';
import { paths } from '@/shared/config/paths';

// The book a page is about, from its address, and the addresses of its
// pages
export function useBookPage() {
  const { id = '' } = useParams();
  const book = useBook(id);
  return {
    book,
    path: paths.book(id),
    editPath: paths.editBook(id),
  };
}
