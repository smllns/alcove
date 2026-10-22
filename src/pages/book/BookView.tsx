import { useState } from 'react';
import { NotebookPen, Pencil, Trash2 } from 'lucide-react';
import type { Book } from '@/entities/book/types';
import { RemoveBookDialog } from '@/features/remove-book';
import { halves } from '@/shared/lib/halves';
import { useGoBack } from '@/shared/lib/useGoBack';
import { cn } from '@/shared/lib/cn';
import { useInView } from '@/shared/lib/useInView';
import { BackLink } from '@/shared/ui/BackLink';
import { Button } from '@/shared/ui/Button';
import { ButtonLink } from '@/shared/ui/ButtonLink';
import { Collapse } from '@/shared/ui/Collapse';
import { RatingFigure } from '@/shared/ui/Rating';
import { Stars } from '@/shared/ui/Stars';
import { sheetClass } from '@/shared/ui/surfaces';
import { AboutBook } from './AboutBook';
import { BookHeading } from './BookHeading';
import { BookLinks } from './BookLinks';
import { CoverShowcase } from './CoverShowcase';
import { BookPassages } from './BookPassages';
import { EditionFacts } from './EditionFacts';
import { PassageQuotes } from './PassageQuotes';
import { QuoteSuggestions } from './QuoteSuggestions';
import { YourCopy } from './YourCopy';
import { paths } from '@/shared/config/paths';

// One book laid out: on a wide screen the cover stays beside everything
// else as it scrolls by, and once the title has gone up out of sight, the
// title comes with it, under the cover
export function BookView({ book, editPath }: { book: Book; editPath: string }) {
  const [removing, setRemoving] = useState(false);
  // A first review being written, from the button beside the cover
  const [reviewing, setReviewing] = useState(false);
  const toLibrary = useGoBack(paths.library);
  const [title, titleInView] = useInView<HTMLDivElement>('0px', true);
  const rating = book.copy?.rating;

  return (
    <article className='grid gap-10 lg:grid-cols-[minmax(0,14rem)_1fr] lg:gap-14 xl:grid-cols-[minmax(0,16rem)_1fr] xl:gap-20'>
      {/* Stays in view as the page scrolls: under the tabs, or, on a wide
          screen where the tabs sit in the header row clear of it, up level
          with them */}
      <div className='flex flex-col items-center gap-6 lg:sticky lg:top-28 lg:items-stretch lg:self-start xl:top-7'>
        {/* Above the cover on a wide screen, level with the top of the
            sheet beside it (BookFrame has it above everything otherwise) */}
        <div className='hidden lg:block'>
          <BackLink to={paths.library} returns className='' />
        </div>
        <CoverShowcase
          book={book}
          className='w-44 animate-rise sm:w-52 lg:w-full'
        />
        <div className='-mb-6 hidden lg:block'>
          <Collapse open={!titleInView}>
            <div className='pb-6'>
              <p className='font-serif text-2xl leading-tight tracking-[-0.01em] text-balance'>
                {book.title}
              </p>
              <p className='mt-1.5 text-sm text-ink-soft'>
                {book.authors.join(', ')}
              </p>
              {rating ? (
                <span
                  role='img'
                  aria-label={`${halves(rating)} out of 5 stars`}
                  className='-ml-0.5 mt-3 flex items-center gap-2'
                >
                  <Stars value={rating} size={18} />
                  <RatingFigure>{halves(rating)}</RatingFigure>
                </span>
              ) : null}
            </div>
          </Collapse>
        </div>
        <div
          className='flex animate-rise flex-wrap justify-center gap-2.5 lg:justify-start'
          style={{ animationDelay: '120ms' }}
        >
          <ButtonLink to={editPath} variant='pill'>
            <Pencil size={14} />
            Edit
          </ButtonLink>
          {!book.copy?.review && !reviewing && (
            <Button variant='pill' onClick={() => setReviewing(true)}>
              <NotebookPen size={14} />
              Write a review
            </Button>
          )}
          <Button
            variant='pill'
            onClick={() => setRemoving(true)}
            className='hover:border-danger hover:text-danger'
          >
            <Trash2 size={14} />
            Remove
          </Button>
        </div>
      </div>

      {/* On a sheet of its own, over the cover's light */}
      <div
        className={cn(
          'relative -mx-2 flex min-w-0 flex-col gap-10 p-5 sm:mx-0 sm:p-10',
          sheetClass,
        )}
      >
        <BookHeading book={book} ref={title} />
        <div
          className='flex animate-rise flex-col gap-10'
          style={{ animationDelay: '240ms' }}
        >
          <AboutBook book={book} />
          <BookPassages
            book={book}
            reviewing={reviewing}
            onReviewStarted={() => setReviewing(false)}
          />
          <YourCopy book={book} />
          <EditionFacts book={book} />
          {/* The lines kept and the links, then more lines to keep */}
          <PassageQuotes book={book} />
          <BookLinks book={book} />
          <QuoteSuggestions book={book} />
        </div>
      </div>

      <RemoveBookDialog
        book={book}
        open={removing}
        onClose={() => setRemoving(false)}
        onRemoved={() => void toLibrary()}
      />
    </article>
  );
}
