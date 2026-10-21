import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { X, ZoomIn } from 'lucide-react';
import { liftedCover } from '@/entities/book/coverImage';
import type { Book } from '@/entities/book/types';
import { BookCover } from '@/entities/book/ui/BookCover';
import { cn } from '@/shared/lib/cn';
import { reducedMotionNow } from '@/shared/lib/motion';
import { setPageTransition } from '@/shared/lib/pageTransition';
import { IconButton } from '@/shared/ui/IconButton';
import { floatingClass } from '@/shared/ui/surfaces';

// The book's cover on its page, with a magnifying cursor either way (over
// the pointer every button otherwise shows, index.css). Hovered, it lifts
// off the page with a deeper shadow and a magnifier in its corner;
// clicked, it opens up to fill the screen, and goes back with the × (or
// anywhere, or Escape).
export function CoverShowcase({
  book,
  className,
}: {
  book: Book;
  className?: string;
}) {
  const [zoomed, setZoomed] = useState(false);
  const close = useRef<HTMLButtonElement>(null);

  // Drawn up or put back with the cover itself moving between the two
  const zoom = (next: boolean) => {
    const change = () => flushSync(() => setZoomed(next));
    if (!document.startViewTransition || reducedMotionNow()) {
      change();
      return;
    }
    setPageTransition('zoom');
    document.startViewTransition(change);
  };

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === 'Escape') zoom(false);
  });
  useEffect(() => {
    if (!zoomed) return;
    close.current?.focus();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoomed]);

  const cover = (big: boolean) => (
    <BookCover
      title={book.title}
      author={book.authors[0]}
      url={book.cover?.url}
      size='L'
      bookId={big ? undefined : book.id}
      home={!big}
      className={cn(
        'cover-zoom w-full transition-shadow duration-700 ease-soft',
        liftedCover,
        !big &&
          'group-hover:shadow-[0_44px_64px_-26px_rgb(var(--shade)/calc(0.6*var(--shade-k))),0_6px_16px_rgb(var(--shade)/calc(0.16*var(--shade-k)))]',
      )}
    />
  );

  return (
    <>
      <button
        type='button'
        aria-label='See the cover larger'
        onClick={() => zoom(true)}
        className={cn(
          'group block cursor-zoom-in! outline-offset-8 focus-visible:outline-2 focus-visible:outline-ink',
          className,
        )}
      >
        <div
          // Hidden while it's up on the screen, where it is instead
          className={cn(
            'relative transition-transform duration-700 ease-soft group-hover:-translate-y-2 group-active:translate-y-0 group-active:scale-[0.98] group-active:duration-200',
            zoomed && 'invisible',
          )}
        >
          {zoomed ? <div className='aspect-2/3' /> : cover(false)}
          <span
            aria-hidden
            className={cn(
              'absolute bottom-3 right-3 grid size-9 translate-y-1 place-items-center rounded-full text-ink opacity-0 transition-all duration-500 ease-soft group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100',
              floatingClass,
            )}
          >
            <ZoomIn size={16} />
          </span>
        </div>
      </button>

      {/* Over everything, outside the page's own layers. A click anywhere
          puts it back; the × says so. */}
      {zoomed &&
        createPortal(
          <div
            role='dialog'
            aria-modal='true'
            aria-label={`The cover of “${book.title}”`}
            onClick={() => zoom(false)}
            className='fixed inset-0 z-50 grid cursor-zoom-out! place-items-center bg-[rgb(var(--glow)/0.9)] p-6 backdrop-blur-md'
          >
            <IconButton
              ref={close}
              aria-label='Close'
              // Its click reaches the backdrop, which puts the cover back
              className='absolute right-5 top-5 animate-rise sm:right-8 sm:top-8'
            >
              <X size={18} />
            </IconButton>
            <div className='w-[min(84vw,56vh)]'>{cover(true)}</div>
          </div>,
          document.body,
        )}
    </>
  );
}
