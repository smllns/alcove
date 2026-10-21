import type { ReactNode } from 'react';
import { formatLabel } from '@/entities/book/formats';
import { languageName } from '@/entities/book/languages';
import type { Book } from '@/entities/book/types';
import { cn } from '@/shared/lib/cn';
import { paperClass } from '@/shared/ui/surfaces';
import { captionClass } from '@/shared/ui/fieldStyles';
import { BookSection } from './BookSection';

type Entry = [label: string, value: ReactNode];

// The book itself, as a library would file it: a catalogue card of its
// genres, when it came out, who published it, how long it is,
// what language it's in, and its number
export function EditionFacts({ book }: { book: Book }) {
  const translated =
    book.language &&
    book.originalLanguage &&
    book.language !== book.originalLanguage;
  const genres = book.genres ?? [];
  const otherEdition =
    book.firstPublishedYear &&
    book.publishedYear &&
    book.publishedYear !== book.firstPublishedYear;
  const length = [
    book.pages && `${book.pages} pages`,
    book.format && formatLabel(book.format).toLowerCase(),
  ]
    .filter(Boolean)
    .join(', ');

  const entries: Entry[] = [
    [
      'Published',
      (book.firstPublishedYear || book.publishedYear) && (
        <>
          {book.firstPublishedYear ?? book.publishedYear}
          {otherEdition && (
            <span className='text-muted'>
              {' '}
              · this edition {book.publishedYear}
            </span>
          )}
        </>
      ),
    ],
    ['Publisher', book.publisher],
    ['Length', length && length.charAt(0).toUpperCase() + length.slice(1)],
    [
      'Language',
      book.language && (
        <>
          {languageName(book.language)}
          {translated && (
            <span className='text-muted'>
              {' '}
              · from {languageName(book.originalLanguage!)}
              {book.translators?.length
                ? `, by ${book.translators.join(', ')}`
                : ''}
            </span>
          )}
        </>
      ),
    ],
    ['Original title', translated && book.originalTitle],
    ['ISBN', book.isbn],
  ];
  // Filed under: what a library card calls its subjects
  if (genres.length) entries.unshift(['Genres', genres.join(', ')]);
  const known = entries.filter(([, value]) => value);
  if (!known.length) return null;

  return (
    <BookSection title='The book'>
      {
        // A catalogue card: one rule in red under its top edge, the rest
        // ruled lightly between its lines
        <dl
          className={cn(
            'overflow-hidden rounded-lg border border-line/70',
            paperClass,
          )}
        >
          <div aria-hidden className='h-3 border-b border-(--margin-rule)' />
          {known.map(([label, value]) => (
            <div
              key={label}
              className='grid grid-cols-[7.5rem_1fr] items-baseline gap-4 border-b border-(--rule) px-5 py-3 last:border-b-0 sm:grid-cols-[9rem_1fr]'
            >
              <dt className={captionClass}>{label}</dt>
              <dd className='font-serif text-[16px] text-ink'>{value}</dd>
            </div>
          ))}
        </dl>
      }
    </BookSection>
  );
}
