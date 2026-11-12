import { useWorkDetails } from '@/entities/book/catalogueQueries';
import { liftedCover } from '@/entities/book/coverImage';
import type { Book } from '@/entities/book/types';
import { BookCover } from '@/entities/book/ui/BookCover';
import { cn } from '@/shared/lib/cn';
import { ZoomShowcase } from '@/shared/ui/ZoomShowcase';
import { CoverSticker } from './CoverSticker';

// The book's cover on its page, opening up to fill the screen as a
// picture does (ZoomShowcase), with a deeper shadow as it lifts. One with
// none of its own, a cover a reader of alcove gave the same work, if any
// did
export function CoverShowcase({
  book,
  owned,
  className,
}: {
  book: Book;
  // On the reader's shelves, or not: a sticker on the cover's corner says
  owned: boolean;
  className?: string;
}) {
  const details = useWorkDetails(
    book.cover ? undefined : book.openLibrary?.work,
  );
  const url = book.cover?.url ?? details.data?.readersCover;
  return (
    <ZoomShowcase
      label='See the cover larger'
      bigLabel={`The cover of “${book.title}”`}
      place='aspect-2/3'
      bigClass='w-[min(84vw,56vh)]'
      className={className}
      picture={(big) => (
        <BookCover
          title={book.title}
          author={book.authors[0]}
          url={url}
          size='L'
          bookId={big ? undefined : book.id}
          home={!big}
          className={cn(
            'cover-zoom w-full transition-shadow duration-700 ease-soft',
            liftedCover,
            !big &&
              'group-hover:shadow-[0_44px_64px_-26px_rgb(var(--shade)/calc(0.6*var(--shade-k))),0_6px_16px_rgb(var(--shade)/calc(0.16*var(--shade-k)))]',
          )}
        >
          {!big && <CoverSticker owned={owned} />}
        </BookCover>
      )}
    />
  );
}
