import type { Book } from '@/entities/book/types';
import { cn } from '@/shared/lib/cn';
import { Rating } from '@/shared/ui/Rating';
import { raisedClass } from '@/shared/ui/surfaces';

// A star's title, writer and rating, under it as it's pointed at: clear of
// the grown cover (it reaches 19% of its width further down), on a card of
// its own, so it reads over whatever covers are behind it
export function StarCaption({ book, author }: { book: Book; author: string }) {
  return (
    <div className='star-caption pointer-events-none absolute left-1/2 top-full mt-[30%] flex w-64 justify-center'>
      <div
        className={cn(
          'max-w-full rounded-2xl px-4 py-2.5 text-center',
          raisedClass,
        )}
      >
        <p className='line-clamp-2 font-serif text-[1.0625rem] leading-snug tracking-[-0.01em] text-ink'>
          {book.title}
        </p>
        {author && (
          <p className='mt-1 line-clamp-1 text-[0.8125rem] text-ink-soft'>
            {author}
          </p>
        )}
        {book.copy?.rating ? (
          <Rating value={book.copy.rating} className='mt-1 text-[0.8125rem]' />
        ) : null}
      </div>
    </div>
  );
}
