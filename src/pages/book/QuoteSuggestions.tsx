import { useRef, useState } from 'react';
import { keepInPlace } from '@/shared/lib/keepInPlace';
import { useEditCopy } from '@/entities/book/queries';
import { useBookQuotes } from '@/entities/book/catalogueQueries';
import type { Book } from '@/entities/book/types';
import { Collapse, COLLAPSE_MS } from '@/shared/ui/Collapse';
import { Fold } from '@/shared/ui/Fold';
import { FormError } from '@/shared/ui/FormError';
import { AddButton, QuietButton } from '@/shared/ui/ListControls';
import { BookSection } from './BookSection';

// Shown at first; the rest on asking
const FIRST = 4;

// Lines from the book that others have kept (on Wikiquote), to keep among
// the reader's own quotes with a click. One kept folds away and grows into
// the reader's quotes; the rest of the list opens out on asking. With none
// left, or none found, there's no list at all.
export function QuoteSuggestions({ book }: { book: Book }) {
  const found = useBookQuotes(book.title, book.authors[0]);
  const { save, pending, error } = useEditCopy(book);
  const [all, setAll] = useState(false);
  const toggle = useRef<HTMLDivElement>(null);
  // Kept, and folding away before it moves over
  const [leaving, setLeaving] = useState<string | null>(null);
  const kept = (pending ?? book.copy)?.quotes ?? [];
  // Not those kept already, even once trimmed or added to
  const offered = (found.data?.quotes ?? []).filter(
    (q) => !kept.some((k) => k.includes(q) || q.includes(k)),
  );
  if (!offered.length) return null;

  const keep = (quote: string) => {
    setLeaving(quote);
    window.setTimeout(() => {
      save({ quotes: [...kept, quote] });
      setLeaving(null);
    }, COLLAPSE_MS);
  };

  return (
    <BookSection title='Lines from the book'>
      {/* Those past the first few open out when asked for */}
      <ul>
        {offered.map((quote, i) => (
          <li key={quote}>
            <Collapse open={leaving !== quote && (all || i < FIRST)}>
              <div className='flex flex-col gap-1.5 pb-5 sm:flex-row sm:items-start sm:gap-6'>
                <div className='min-w-0 flex-1'>
                  <Fold
                    lines={4}
                    className='whitespace-pre-line font-serif text-base leading-relaxed text-ink-soft italic'
                  >
                    {quote}
                  </Fold>
                </div>
                <AddButton onClick={() => keep(quote)} className='shrink-0'>
                  Keep
                </AddButton>
              </div>
            </Collapse>
          </li>
        ))}
      </ul>
      {offered.length > FIRST && (
        <div ref={toggle} className='-mt-2'>
          <QuietButton
            onClick={() => {
              // Folding back, the page goes along with it
              if (all) keepInPlace(toggle.current, COLLAPSE_MS);
              setAll(!all);
            }}
          >
            {all ? 'Fewer' : `${offered.length - FIRST} more`}
          </QuietButton>
        </div>
      )}
      <FormError message={error} small className='mt-2' />
      {/* Credit, as Wikiquote's licence asks */}
      <p className='mt-4 text-xs text-faint'>
        From{' '}
        <a
          href={found.data?.source ?? 'https://en.wikiquote.org'}
          target='_blank'
          rel='noreferrer'
          className='underline decoration-line underline-offset-2 transition-colors duration-500 ease-soft hover:text-ink'
        >
          Wikiquote
        </a>
        , shared under CC BY-SA.
      </p>
    </BookSection>
  );
}
