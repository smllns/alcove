import { useState, type ReactNode } from 'react';
import type { Book, SimilarBook } from '@/entities/book/types';
import { Collapse } from '@/shared/ui/Collapse';
import { Button } from '@/shared/ui/Button';
import { FloatingBar } from '@/shared/ui/FloatingBar';
import { MoreToggle } from '@/shared/ui/MoreToggle';
import { Arriving } from '../Arriving';
import { BookRow } from '../BookRow';
import { TitledSection } from '@/shared/ui/TitledSection';
import { asRowBook } from '../useTheirOthers';
import { SameBookDialog } from './SameBookDialog';
import { useSameBook } from './useSameBook';

// Of those not on the shelves, shown at first, the rest on asking
const FIRST = 12;

// The writer's books the reader has, once all the shelves are in, and
// those of the catalogue's they haven't (`more`), the most read first,
// each of those with a way to say it's theirs after all, under another
// title (useSameBook); each part opening out as it comes, in rows of
// covers at every width
export function AuthorBooks({
  theirs,
  known,
  more,
  children,
}: {
  theirs: Book[];
  known: boolean;
  more: SimilarBook[];
  // Between the two (the one to read next, say)
  children?: ReactNode;
}) {
  const [all, setAll] = useState(false);
  const same = useSameBook(theirs);
  const [asked, setAsked] = useState<SimilarBook>();
  const [asking, setAsking] = useState(false);
  // Theirs under another title, the reader says: a way to say so, on each
  // cover, when there's any book of theirs it could be
  const action = theirs.length
    ? (work: SimilarBook) => (
        <button
          type='button'
          onClick={() => {
            setAsked(work);
            setAsking(true);
          }}
          className='cursor-pointer rounded-full bg-surface/90 px-2.5 py-1 text-xs text-ink shadow-[0_4px_10px_-4px_rgb(var(--shade)/0.5)] backdrop-blur-sm transition-colors duration-300 ease-soft hover:bg-surface'
        >
          I have this
        </button>
      )
    : undefined;
  const folds = more.length > FIRST;

  return (
    <>
      <Arriving ready={known && theirs.length > 0}>
        <TitledSection title='On your shelves'>
          <BookRow books={theirs.map(asRowBook)} ours byline={false} grid />
        </TitledSection>
      </Arriving>
      {children}
      <Arriving ready={more.length > 0}>
        <TitledSection title='Not on your shelves yet'>
          <BookRow
            books={folds ? more.slice(0, FIRST) : more}
            byline={false}
            grid
            action={action}
          />
          {folds && (
            <>
              <Collapse open={all}>
                <BookRow
                  books={more.slice(FIRST)}
                  byline={false}
                  grid
                  action={action}
                  className='pt-6'
                />
              </Collapse>
              <MoreToggle
                open={all}
                onClick={() => setAll(!all)}
                className='mt-5'
              >
                {all ? 'Show fewer' : `Show all ${more.length}`}
              </MoreToggle>
            </>
          )}
        </TitledSection>
      </Arriving>
      <SameBookDialog
        work={asked}
        open={asking}
        theirs={theirs}
        onPick={(book) => {
          if (asked) same.say(asked, book);
          setAsking(false);
        }}
        onClose={() => setAsking(false)}
      />
      <FloatingBar shown={Boolean(same.said && same.book)}>
        <span className='min-w-0 truncate'>
          “{same.said?.work.title}” is now your “{same.book?.title}”
        </span>
        <Button variant='pill' onClick={same.undo}>
          Undo
        </Button>
      </FloatingBar>
    </>
  );
}
