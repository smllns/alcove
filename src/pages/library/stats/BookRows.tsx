import type { Book } from '@/entities/book/types';
import { BookLine } from '@/entities/book/ui/BookLine';
import { ownBookLine } from '@/entities/book/ui/ownBookLine';
import { BookLink } from '../views/BookLink';

// Books one under another, each its cover with its title and author
// beside it, leading to its page, its cover flying over to it
export function BookRows({ books }: { books: Book[] }) {
  return (
    <ul className='flex flex-col gap-1'>
      {books.map((book) => (
        <li key={book.id}>
          <BookLink
            id={book.id}
            draggable={false}
            className='group -mx-2 flex rounded-xl px-2 py-1.5 transition-colors duration-300 ease-soft hover:bg-ink/5'
          >
            <BookLine {...ownBookLine(book)} />
          </BookLink>
        </li>
      ))}
    </ul>
  );
}
