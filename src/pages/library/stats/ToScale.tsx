import type { CSSProperties } from 'react';
import { useSpineColour } from '@/entities/book/coverTone';
import type { Book } from '@/entities/book/types';
import { paths } from '@/shared/config/paths';
import { cn } from '@/shared/lib/cn';
import { counted } from '@/shared/lib/plural';
import { labelClass } from '@/shared/ui/fieldStyles';
import { TransitionLink } from '@/shared/ui/TransitionLink';
import type { extremes } from './libraryStats';

// How tall the books are drawn, and how wide the thickest may be
const TALL = 190;
const WIDEST = 160;

// The thickest book, an average one (only outlined, being no book in
// particular) and the slimmest, standing on one plank to the same scale,
// as thick as their pages, each with a fine line under it giving its width
export function ToScale({
  found,
}: {
  found: NonNullable<ReturnType<typeof extremes>>;
}) {
  const { longest, shortest, average, counted: paged } = found;
  const scale = Math.min(0.1, WIDEST / longest.pages!);
  const widthOf = (pages: number) => Math.max(5, Math.round(pages * scale));
  return (
    <div className='relative flex items-start gap-4 sm:gap-9'>
      <div
        className='stats-plank absolute inset-x-0 -left-3'
        style={{ top: TALL }}
      />
      <Standing
        width={widthOf(longest.pages!)}
        kind='The doorstop'
        book={longest}
      />
      <Standing
        width={widthOf(average)}
        kind='Your average'
        title={counted(average, 'page')}
        detail={`across ${counted(paged, 'book')} with a page count`}
      />
      <Standing
        width={widthOf(shortest.pages!)}
        kind='The slimmest'
        book={shortest}
      />
    </div>
  );
}

// One of them: a book, or the average no book is
function Standing({
  width,
  kind,
  book,
  title = book?.title,
  detail = book &&
    [book.authors.join(', '), counted(book.pages!, 'page')]
      .filter(Boolean)
      .join(' · '),
}: {
  width: number;
  kind: string;
  book?: Book;
  title?: string;
  detail?: string;
}) {
  const caption = (
    <>
      <span className={cn(labelClass, 'mt-2.5 block')}>{kind}</span>
      <span className='mt-1 block font-serif text-[15px] leading-snug'>
        {title}
      </span>
      <span className='block text-xs text-muted'>{detail}</span>
    </>
  );
  return (
    <div className='flex max-w-26 min-w-0 flex-col items-center text-center sm:max-w-38'>
      {book ? (
        <Body book={book} width={width} />
      ) : (
        <span
          className='block rounded-[2px] border border-dashed border-faint'
          style={{ width, height: TALL }}
        />
      )}
      <span className='stats-width mt-4' style={{ width }} />
      {book ? (
        <TransitionLink
          to={paths.book(book.id)}
          className='transition-colors hover:text-ink-soft'
        >
          {caption}
        </TransitionLink>
      ) : (
        caption
      )}
    </div>
  );
}

// A book standing, in its cover's colour, its title along its spine when
// there's room for it
function Body({ book, width }: { book: Book; width: number }) {
  const colour = useSpineColour(book, 'var(--spine-pending)');
  return (
    <span
      className='list-spine flex rotate-180 items-center justify-center overflow-hidden rounded-[2px] font-serif text-sm whitespace-nowrap text-[#f3e8d3] italic [writing-mode:vertical-rl]'
      style={{ width, height: TALL, '--tone': colour } as CSSProperties}
    >
      {width > 26 && book.title}
    </span>
  );
}
