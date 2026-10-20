import { Fragment, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { BookCover } from './BookCover';

const sizes = {
  // In a compact dropdown
  sm: {
    gap: 'gap-3',
    cover: 'w-9 shadow-[0_6px_10px_-6px_rgba(40,28,14,0.5)]',
    image: 'S',
    title: 'text-[15px] leading-snug',
    byline: 'mt-0.5 text-xs',
    details: 'mt-1 text-xs',
  },
  // In a list of books
  md: {
    gap: 'gap-4',
    cover: 'w-12 shadow-[0_8px_14px_-8px_rgba(40,28,14,0.5)]',
    image: 'M',
    title: 'text-[17px] leading-tight',
    byline: 'mt-1 text-sm',
    details: 'mt-1 text-xs',
  },
  // A list with room to spare: the size of `md` on a phone, larger above
  lg: {
    gap: 'gap-4 sm:gap-6',
    cover:
      'w-12 shadow-[0_8px_14px_-8px_rgba(40,28,14,0.5)] sm:w-20 sm:shadow-[0_14px_24px_-12px_rgba(40,28,14,0.5)]',
    image: 'L',
    title: 'text-[17px] leading-tight sm:text-2xl',
    byline: 'mt-1 text-sm sm:mt-1.5 sm:text-base',
    details: 'mt-1 text-xs sm:mt-2 sm:text-sm',
  },
} as const;

type BookLineProps = {
  title: string;
  // The authors, as they should read
  byline: string;
  coverUrl?: string;
  // Small facts after the byline (a year, a format, a rating), set apart
  // by dots; empty ones are left out
  details?: ReactNode[];
  size?: keyof typeof sizes;
};

// One book on a line: a small cover, then its title, who wrote it and the
// odd detail. The row around it (a link, a button, a card) is the caller's.
export function BookLine({
  title,
  byline,
  coverUrl,
  details = [],
  size = 'md',
}: BookLineProps) {
  const look = sizes[size];
  const shown = details.filter(Boolean);
  return (
    <span className={cn('flex min-w-0 flex-1 items-center', look.gap)}>
      <BookCover
        title={title}
        author={byline}
        url={coverUrl}
        size={look.image}
        // Picked up a little when the row around it (a `group`) is hovered
        className={cn(
          'shrink-0 transition-transform duration-500 ease-soft group-hover:-translate-y-1 group-hover:-rotate-2',
          look.cover,
        )}
      />
      <span className='min-w-0 flex-1'>
        <span
          className={cn(
            'block truncate font-serif tracking-[-0.01em] text-ink',
            look.title,
          )}
        >
          {title}
        </span>
        {byline && (
          <span className={cn('block truncate text-muted', look.byline)}>
            {byline}
          </span>
        )}
        {shown.length > 0 && (
          <span className={cn('block text-faint', look.details)}>
            {shown.map((detail, i) => (
              <Fragment key={i}>
                {i > 0 && ' · '}
                {detail}
              </Fragment>
            ))}
          </span>
        )}
      </span>
    </span>
  );
}
