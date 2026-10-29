import type { Book } from '../types';

// One of the reader's own books as a line: its title, its writers, its
// cover (the one that flies to its page)
export const ownBookLine = (book: Book) => ({
  title: book.title,
  byline: book.authors.join(', '),
  coverUrl: book.cover?.url,
  bookId: book.id,
});
