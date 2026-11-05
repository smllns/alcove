import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { useCatalogueSearch } from '@/entities/book/catalogueQueries';
import type { OurEdition } from '@/entities/book/ourEdition';
import type { CatalogueEdition, CatalogueWork } from '@/entities/book/types';
import { useDebouncedValue } from '@/shared/lib/useDebouncedValue';
import { RemoveButton } from '@/shared/ui/ListControls';
import { Spinner } from '@/shared/ui/Spinner';
import { OurResults } from './OurResults';
import { SearchResult } from './SearchResult';
import { FormError } from '@/shared/ui/FormError';
import { textLinkClass } from '@/shared/ui/buttonStyles';
import { cn } from '@/shared/lib/cn';
import { HOVER, useMediaQuery } from '@/shared/lib/useMediaQuery';
import { isbnFrom, ScanButton } from '@/features/scan-isbn';
import { Button } from '@/shared/ui/Button';
import { paths } from '@/shared/config/paths';
import { TransitionLink } from '@/shared/ui/TransitionLink';

type CatalogueSearchProps = {
  onPick: (work: CatalogueWork, isbnEdition?: CatalogueEdition) => void;
  // By hand, with the ISBN looked for and not found, if there was one
  onManual: (isbn?: string) => void;
  // A printing alcove knows and Open Library doesn't, picked
  onOurs: (edition: OurEdition) => void;
  // Searched for from the start: a book kept only by its title
  initialQuery?: string;
};

// Search as you type, by title, author or ISBN; or, on a phone or tablet,
// by the barcode on the back, read with the camera: its ISBN searched for,
// and the book it's found to be picked straight away, that very printing.
// Under what Open Library found, printings alcove knows and it doesn't
// (OurResults), one scanned picked straight away too. An ISBN neither
// has: adding it by hand offered right there (coming softly into view,
// after a scan), the ISBN filled in.
export function CatalogueSearch({
  onPick,
  onManual,
  onOurs,
  initialQuery = '',
}: CatalogueSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [scanned, setScanned] = useState<string>();
  const settled = useDebouncedValue(query.trim(), 350);
  const search = useCatalogueSearch(settled);
  const results = search.data?.results ?? [];
  const ours = search.data?.ours ?? [];
  const searching =
    settled.length >= 2 && (search.isFetching || settled !== query.trim());
  const hover = useMediaQuery(HOVER);
  const edition = search.data?.isbnEdition;
  const top = results[0];
  const manual = useRef<HTMLButtonElement>(null);
  // An ISBN looked for (typed or scanned) and not found
  const unknown =
    !searching && !search.isError && settled && !results.length && !ours.length
      ? isbnFrom(settled)
      : null;
  const missedScan = Boolean(unknown) && unknown === scanned;

  // A scanned book found: on to it (the search giving way to the book)
  const pick = useEffectEvent(onPick);
  const pickOurs = useEffectEvent(onOurs);
  const ourFirst = ours[0];
  useEffect(() => {
    if (!scanned || settled !== scanned || searching) return;
    if (top && edition) pick(top, edition);
    else if (!top && ourFirst) pickOurs(ourFirst);
  }, [scanned, settled, searching, top, edition, ourFirst]);
  // A scanned book not found: the way to add it by hand brought into view
  useEffect(() => {
    if (missedScan)
      manual.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [missedScan]);

  return (
    <div className='flex flex-1 flex-col'>
      <label className='flex items-center gap-3 border-b border-line pb-3 transition-colors duration-500 ease-soft focus-within:border-ink'>
        <Search size={20} className='shrink-0 text-faint' />
        <input
          autoFocus
          type='search'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Title, author or ISBN'
          aria-label='Search for a book'
          className='min-w-0 flex-1 bg-transparent font-serif text-2xl tracking-[-0.02em] text-ink outline-none placeholder:text-faint sm:text-3xl'
        />
        {searching ? (
          <Spinner />
        ) : (
          query && (
            <RemoveButton onClick={() => setQuery('')} label='Clear search' />
          )
        )}
      </label>

      <ScanButton
        className='mt-4 self-start'
        onFound={(isbn) => {
          setQuery(isbn);
          setScanned(isbn);
        }}
      />

      {/* Stretching to the foot of the screen, the way to add by hand under it */}
      <div className='mt-6 min-h-14 flex-1'>
        {search.isError ? (
          <FormError message={search.error.message} />
        ) : settled.length < 2 ? (
          <p className='text-sm text-muted'>
            {hover
              ? 'Start typing and pick your book from the list.'
              : 'Start typing, or scan the barcode on the back, and pick your book.'}
          </p>
        ) : unknown ? (
          <div className='flex flex-col items-start gap-5'>
            <p className='animate-arrive text-sm text-muted'>
              No book with the ISBN {unknown} in the catalogue yet. Add it by
              hand, its ISBN filled in for you.
            </p>
            <Button
              ref={manual}
              arrow
              onClick={() => onManual(unknown)}
              className='animate-arrive [animation-delay:120ms]'
            >
              Add it by hand
            </Button>
          </div>
        ) : !results.length && !ours.length && !searching ? (
          <p className='text-sm text-muted'>Nothing found for “{settled}”.</p>
        ) : (
          <>
            <ul
              className={
                searching
                  ? 'opacity-60 transition-opacity'
                  : 'transition-opacity'
              }
            >
              {results.map((work, i) => (
                <li key={work.workKey}>
                  <SearchResult
                    work={work}
                    // An ISBN search's exact printing belongs to its top result
                    onPick={() =>
                      onPick(
                        work,
                        i === 0
                          ? (search.data?.isbnEdition ?? undefined)
                          : undefined,
                      )
                    }
                  />
                </li>
              ))}
            </ul>
            <OurResults editions={ours} onPick={onOurs} />
          </>
        )}
      </div>

      {!unknown && (
        <p className='mt-8 text-sm text-muted'>
          Can’t find it?{' '}
          <button
            type='button'
            onClick={() => onManual()}
            className={cn('text-ink', textLinkClass)}
          >
            Add it by hand
          </button>
        </p>
      )}
      <p className='mt-2 text-sm'>
        <TransitionLink
          to={paths.importBooks}
          className={cn('text-ink', textLinkClass)}
        >
          Import from Goodreads or StoryGraph
        </TransitionLink>
      </p>
    </div>
  );
}
