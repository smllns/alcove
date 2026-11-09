import { useState } from 'react';
import { useParams } from 'react-router';
import { useAuthorWorks, useWriterQuotes } from '@/entities/book/authorQueries';
import { paths } from '@/shared/config/paths';
import { cn } from '@/shared/lib/cn';
import { counted } from '@/shared/lib/plural';
import { hasCyrillic } from '@/shared/lib/spelling';
import { settled } from '@/shared/lib/settled';
import { BackLink } from '@/shared/ui/BackLink';
import { BackToTop } from '@/shared/ui/BackToTop';
import { Collapse } from '@/shared/ui/Collapse';
import { Spinner } from '@/shared/ui/Spinner';
import { sheetClass } from '@/shared/ui/surfaces';
import { Arriving } from '../Arriving';
import { BookFrame } from '../BookFrame';
import { AuthorBio } from './AuthorBio';
import { AuthorBooks } from './AuthorBooks';
import { AuthorHeading } from './AuthorHeading';
import { AuthorQuote } from './AuthorQuote';
import { LifeAndWorks } from './LifeAndWorks';
import { useWriter } from './useWriter';
import { useMatchedWorks } from '@/entities/book/useMatchedWorks';
import { lifePins } from './writerBooks';
import { readerFigures } from './readerFigures';
import { AuthorNext } from './AuthorNext';
import { AuthorNotes } from './AuthorNotes';
import { keptNotes } from './keptNotes';
import { YouAndThem } from './YouAndThem';

// A quote short enough to close the page on, if there's one
const SHORT = 200;

// A writer's page, opened from their name, laid out as a book's is: who
// they were beside everything else, staying in view on a wide screen as
// it scrolls by; and on a sheet of its own, the first lines about them,
// the reader and them in numbers, their books on the reader's shelves, the
// one to read next and the rest not yet, what the reader kept from them,
// all of their books along their life, and words of their own. What
// comes from elsewhere opens out as it comes.
export function AuthorPage() {
  const { name = '' } = useParams();
  const writer = useWriter(name);
  // The top of the page (not who they are, which stays in view beside it
  // on a wide screen): gone up out of sight, there's a way back up
  const [top, setTop] = useState<HTMLSpanElement | null>(null);
  const works = useAuthorWorks(writer.authorKey);
  // Wikiquote has them by the name the catalogue does, in Latin letters
  const known = writer.author?.name;
  const quotes = useWriterQuotes(
    !writer.waiting && known && !hasCyrillic(known) ? known : undefined,
  );
  const found = quotes.data?.quotes ?? [];
  const quote = found.find((each) => each.length <= SHORT) ?? found[0];
  const source = quotes.data?.source;

  const {
    matched,
    works: theirWorks,
    copyOf,
    unread,
  } = useMatchedWorks(
    writer.theirs,
    works.data ?? [],
    writer.known && !writer.keying && settled(works),
    writer.author?.born,
    writer.author?.died,
  );
  const [next] = unread;
  const pins = lifePins(theirWorks, writer.theirs, copyOf);
  const notes = keptNotes(
    writer.theirs,
    found.filter((each) => each !== quote),
    source,
  );
  // Once every book of theirs to put on it is in, so none is added after
  const lined = matched && pins.length > 1;
  // Something about them still on its way: who they are, their books in
  // the catalogue and which are the reader's, their words
  const coming =
    writer.waiting ||
    !writer.known ||
    writer.keying ||
    (Boolean(writer.authorKey) && !matched) ||
    !settled(quotes);
  const { read, of } = readerFigures(writer.theirs);
  const shelved =
    writer.known && of > 0
      ? `${counted(of, 'book')} on your shelves · ${read} read`
      : undefined;

  return (
    <BookFrame back={paths.library} wide backBeside>
      <span ref={setTop} aria-hidden className='block h-px' />
      <article className='grid gap-10 lg:grid-cols-[minmax(0,15rem)_1fr] lg:gap-14 xl:grid-cols-[minmax(0,17rem)_1fr] xl:gap-20'>
        <div className='lg:sticky lg:top-28 lg:self-start xl:top-7'>
          <div className='hidden lg:block'>
            <BackLink to={paths.library} returns />
          </div>
          <AuthorHeading
            name={name}
            author={writer.author}
            waiting={writer.waiting}
            shelved={shelved}
          />
        </div>
        <div
          className={cn(
            'relative -mx-2 flex min-w-0 flex-col gap-10 p-5 sm:mx-0 sm:p-10',
            sheetClass,
          )}
        >
          <Arriving ready={Boolean(writer.author?.bio)}>
            {writer.author && <AuthorBio author={writer.author} />}
          </Arriving>
          <Arriving ready={writer.known && writer.theirs.length > 0}>
            <YouAndThem theirs={writer.theirs} />
          </Arriving>
          <AuthorBooks
            theirs={writer.theirs}
            known={writer.known}
            more={unread}
          >
            <Arriving ready={Boolean(next)}>
              {next && <AuthorNext work={next} />}
            </Arriving>
          </AuthorBooks>
          <Arriving ready={writer.known && settled(quotes) && notes.length > 0}>
            <AuthorNotes notes={notes} source={source} />
          </Arriving>
          <Arriving ready={lined}>
            <LifeAndWorks
              pins={pins}
              born={writer.author?.born}
              died={writer.author?.died}
            />
          </Arriving>
          <Arriving ready={Boolean(quote && source)}>
            {quote && source && <AuthorQuote quote={quote} source={source} />}
          </Arriving>
          {/* While more is still to come, a spinner under what's come, the
              parts opening out over it; all in, it folds away. Its own gap
              brought along, as Arriving's is, so none's left after it. */}
          <div className='-mt-10' role='status' aria-busy={coming}>
            <Collapse open={coming}>
              <div className='grid place-items-center pb-4 pt-16 text-2xl text-muted'>
                <Spinner />
              </div>
            </Collapse>
          </div>
        </div>
      </article>
      <BackToTop after={top} />
    </BookFrame>
  );
}
