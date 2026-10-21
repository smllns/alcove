import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Pencil } from 'lucide-react';
import { useEditCopy } from '@/entities/book/queries';
import type { Book } from '@/entities/book/types';
import { cn } from '@/shared/lib/cn';
import { Collapse, COLLAPSE_MS } from '@/shared/ui/Collapse';
import { Fold } from '@/shared/ui/Fold';
import { paperClass } from '@/shared/ui/surfaces';
import { SmoothHeight } from '@/shared/ui/SmoothHeight';
import { FormError } from '@/shared/ui/FormError';
import { BookSection } from './BookSection';
import { HoverAction } from '@/shared/ui/HoverAction';
import { EditableText } from '@/shared/ui/EditableText';
import { EditingHint } from '@/shared/ui/EditingHint';
import { InlineEditor } from '@/shared/ui/InlineEditor';
import { useWriteInPlace } from '@/shared/lib/useWriteInPlace';

// One ruled line of the page, and how far down the first one starts; the
// writing sits a line to each, on the rule
const LINE = 30;
const TOP = 14;

// Line height as LINE, written out for Tailwind to find
const reviewText =
  'whitespace-pre-line font-serif text-[17px] leading-[30px] text-ink';

// A notebook's lines: ruled across, with the margin's line down the left,
// over its old paper
const lines: CSSProperties = {
  backgroundImage: `linear-gradient(to right, transparent 2.25rem, var(--margin-rule) 2.25rem, var(--margin-rule) calc(2.25rem + 1px), transparent calc(2.25rem + 1px)), repeating-linear-gradient(to bottom, transparent 0, transparent ${LINE - 1}px, var(--rule) ${LINE - 1}px, var(--rule) ${LINE}px)`,
  backgroundPosition: `0 0, 0 ${TOP}px`,
};

// What the reader thought of the book, written out on an old notebook's
// page. Changed right here with a click. With none written there's
// nothing here, until the reader asks to write one (`starting`): then it's
// a blank page to write on, gone again if left blank (`onStarted` either
// way).
export function BookReview({
  book,
  starting = false,
  onStarted,
}: {
  book: Book;
  starting?: boolean;
  onStarted?: () => void;
}) {
  const { save, pending, error } = useEditCopy(book);
  const copy = pending ?? book.copy;
  const review = copy?.review;
  const edit = useWriteInPlace(review, (text) => save({ review: text }));
  const { start } = edit;
  // A first review is written from a blank page
  const first = starting && !review;
  const text = edit.writing ?? (first ? '' : null);
  const writing = text !== null;
  const done = (written: string | null) => {
    edit.done(written);
    if (first) onStarted?.();
  };

  // Shown with a review, or a first being written; kept a moment longer
  // when one's abandoned, to fold away rather than vanish
  const open = Boolean(review) || first;
  const [shown, setShown] = useState(open);
  if (open && !shown) setShown(true);
  useEffect(() => {
    if (open || !shown) return;
    const fold = window.setTimeout(() => setShown(false), COLLAPSE_MS);
    return () => window.clearTimeout(fold);
  }, [open, shown]);

  // A first one opening: the page glides down to it as it opens
  const section = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (first)
      section.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [first]);

  if (!open && !shown) return null;

  return (
    // Its own room below it rather than the page's gap, so the gap folds
    // away with it
    <div ref={section} className='-mb-10 scroll-mt-28'>
      <Collapse open={open} appear={first}>
        <div className='pb-10'>
          <BookSection title='Your review'>
            <div
              style={{ paddingTop: TOP, paddingBottom: LINE }}
              className={cn(
                'group relative isolate rounded-md pl-12 pr-5 transition-[translate] duration-500 ease-soft hover:-translate-y-0.5 sm:pl-14 sm:pr-8',
                paperClass,
              )}
            >
              {/* Hovered, it lifts a little, and a pencil on its corner offers
            to change it (as does a click on the words themselves) */}
              {!writing && (
                <HoverAction
                  label='Edit review'
                  icon={<Pencil size={14} />}
                  onClick={() => start()}
                  className='absolute -right-2 -top-3 z-10'
                />
              )}
              <div
                aria-hidden
                style={lines}
                className='pointer-events-none absolute inset-0 -z-10 rounded-md'
              />
              {/* The text, or the box to change it in: they look alike, so one
            simply becomes the other, the page growing or shrinking softly */}
              <SmoothHeight>
                <div>
                  {writing ? (
                    <InlineEditor
                      initial={text ?? review}
                      label='Your review'
                      placeholder='What did you make of it?'
                      className={reviewText}
                      onDone={done}
                    />
                  ) : (
                    <Fold lines={8} className={reviewText}>
                      <EditableText
                        label='Change your review'
                        onEdit={() => start()}
                      >
                        {review}
                      </EditableText>
                    </Fold>
                  )}
                </div>
              </SmoothHeight>
            </div>
            <EditingHint show={writing} />
            <FormError message={error} small className='mt-2' />
          </BookSection>
        </div>
      </Collapse>
    </div>
  );
}
