import { useState } from 'react';
import { useEditCopy } from '@/entities/book/queries';
import type { Book } from '@/entities/book/types';
import { Collapse, COLLAPSE_MS } from '@/shared/ui/Collapse';
import { Fold } from '@/shared/ui/Fold';
import { plural } from '@/shared/lib/plural';
import { RemoveAction } from '@/shared/ui/HoverAction';
import { FormError } from '@/shared/ui/FormError';
import { SmoothHeight } from '@/shared/ui/SmoothHeight';
import { AddButton } from '@/shared/ui/ListControls';
import { BookSection } from './BookSection';
import { takeOffConfirm } from './takeOffConfirm';
import { EditingHint } from '@/shared/ui/EditingHint';
import { editedList } from '@/shared/lib/editList';
import { InlineEditor } from '@/shared/ui/InlineEditor';

const quoteText =
  'whitespace-pre-line font-serif text-base leading-relaxed text-ink italic sm:text-[17px]';

// The gold quotation mark each quote opens with, out in its margin
function QuoteMark() {
  return (
    <span
      aria-hidden
      className='absolute -top-1 left-0 font-serif text-4xl leading-none text-gold opacity-80 sm:text-5xl'
    >
      “
    </span>
  );
}

// The lines the reader kept, each opened by a gold quotation mark. Added
// and taken off right here (changing one is for the edit page), more only
// once there's one; with none, there's nothing here at all. One kept from the book's
// suggestions grows into place; one taken off folds away.
export function PassageQuotes({ book }: { book: Book }) {
  const { save, pending, error } = useEditCopy(book);
  const quotes = (pending ?? book.copy)?.quotes ?? [];
  // Whether a new one is being written
  const [adding, setAdding] = useState(false);
  const [leaving, setLeaving] = useState<string | null>(null);
  // Simply there, rather than growing in: those on the page from the start,
  // and one just written in place (the box it was written in held its
  // room already)
  const [settled, setSettled] = useState(() => new Set(quotes));

  if (!quotes.length) return null;

  const done = (text: string | null) => {
    setAdding(false);
    const next = text === null ? null : editedList(quotes, 'new', text);
    if (!next) return;
    setSettled((s) => new Set(s).add(next.at(-1)!));
    save({ quotes: next });
  };

  // Folded away first, then taken off the list
  const takeOff = (quote: string) => {
    setLeaving(quote);
    window.setTimeout(() => {
      save({ quotes: quotes.filter((q) => q !== quote) });
      setLeaving(null);
    }, COLLAPSE_MS);
  };

  const editor = (initial: string) => (
    <InlineEditor
      initial={initial}
      label='Quote'
      placeholder='A line worth keeping…'
      className={quoteText}
      onDone={done}
    />
  );

  return (
    <BookSection title={plural(quotes.length, 'Quote')}>
      {/* A quote written in, kept or taken off: the list grows and shrinks
          to fit, softly */}
      <SmoothHeight>
        <ul className='pt-1.5'>
          {quotes.map((quote) => (
            <li key={quote}>
              <Collapse open={leaving !== quote} appear={!settled.has(quote)}>
                <blockquote className='group relative pb-5 pl-8 pr-8 sm:pl-9'>
                  <QuoteMark />
                  <Fold lines={4} className={quoteText}>
                    {quote}
                  </Fold>
                  <RemoveAction
                    label='Take this quote off'
                    onClick={() => takeOff(quote)}
                    confirm={takeOffConfirm('quote')}
                    // Its list is cut to its edges as it folds, so the
                    // label goes beside it, not above
                    side='left'
                    className='absolute right-0 top-0'
                  />
                </blockquote>
              </Collapse>
            </li>
          ))}
          {adding && (
            <li className='relative animate-fade-in pb-5 pl-8 sm:pl-9'>
              <QuoteMark />
              {editor('')}
            </li>
          )}
        </ul>
      </SmoothHeight>
      <EditingHint show={adding} />
      {!adding && (
        <AddButton onClick={() => setAdding(true)}>Another quote</AddButton>
      )}
      <FormError message={error} small />
    </BookSection>
  );
}
