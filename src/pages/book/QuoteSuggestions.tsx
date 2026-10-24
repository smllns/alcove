import { useRef, useState } from 'react';
import { themeEase } from '@/shared/lib/easing';
import { foldMotion } from '@/shared/lib/foldMotion';
import { useEditCopy } from '@/entities/book/queries';
import { useBookQuotes } from '@/entities/book/catalogueQueries';
import type { Book } from '@/entities/book/types';
import { Collapse, COLLAPSE_MS } from '@/shared/ui/Collapse';
import { Fold } from '@/shared/ui/Fold';
import { FormError } from '@/shared/ui/FormError';
import { AddButton } from '@/shared/ui/ListControls';
import { MoreToggle } from '@/shared/ui/MoreToggle';
import { Arriving } from './Arriving';
import { BookSection } from './BookSection';
import { SourceCredit } from './SourceCredit';

// Shown at first; the rest on asking
const FIRST = 4;
// As the list's own items open and close (Collapse)
const easeSoft = themeEase('--ease-soft');

// Lines from the book that others have kept (on Wikiquote), to keep among
// the reader's own quotes with a click. One kept folds away and grows into
// the reader's quotes; the rest of the list opens out on asking. The
// section opens out softly once they're found; with none found, or none
// left, there's none, the last kept folding it away.
export function QuoteSuggestions({ book }: { book: Book }) {
  const found = useBookQuotes(book.title, book.authors[0]);
  const { save, pending, error } = useEditCopy(book);
  const [all, setAll] = useState(false);
  const list = useRef<HTMLUListElement>(null);
  // Kept, and folding away before it moves over
  const [leaving, setLeaving] = useState<string | null>(null);
  const kept = (pending ?? book.copy)?.quotes ?? [];
  // Not those kept already, even once trimmed or added to
  const offered = (found.data?.quotes ?? []).filter(
    (q) => !kept.some((k) => k.includes(q) || q.includes(k)),
  );

  const keep = (quote: string) => {
    setLeaving(quote);
    window.setTimeout(() => {
      save({ quotes: [...kept, quote] });
      setLeaving(null);
    }, COLLAPSE_MS);
  };

  return (
    <Arriving ready={offered.length > 0}>
      <BookSection title='Lines from the book'>
        {/* Those past the first few open out when asked for */}
        <ul ref={list}>
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
          <MoreToggle
            open={all}
            onClick={() => {
              // The page holds still, unless the list would close up out
              // of sight above
              foldMotion({
                at: list.current?.children[FIRST] ?? null,
                closing: all,
                ms: COLLAPSE_MS,
                ease: easeSoft,
              });
              setAll(!all);
            }}
            className='-mt-2'
          >
            {all ? 'Fewer' : `${offered.length - FIRST} more`}
          </MoreToggle>
        )}
        <FormError message={error} small className='mt-2' />
        {/* Credit, as Wikiquote's licence asks */}
        <SourceCredit
          source='Wikiquote'
          href={found.data?.source ?? 'https://en.wikiquote.org'}
          className='mt-4'
        />
      </BookSection>
    </Arriving>
  );
}
