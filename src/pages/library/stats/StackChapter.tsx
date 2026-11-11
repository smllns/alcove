import { useMemo, useState, type ReactNode } from 'react';
import type { Book } from '@/entities/book/types';
import { usePlaces } from '@/entities/place/queries';
import { counted } from '@/shared/lib/plural';
import { PHONE, useMediaQuery } from '@/shared/lib/useMediaQuery';
import { Crossfade } from '@/shared/ui/Crossfade';
import { SmoothHeight } from '@/shared/ui/SmoothHeight';
import { arrange, type HomeBooks } from '@/entities/place/arrange';
import { HomeTitle } from '@/entities/place/ui/HomeTitle';
import { BlockOfFlats } from './BlockOfFlats';
import { Mark, sayClass } from './Chapter';
import { HomeSection } from './HomeSection';
import { PhoneStack } from './PhoneStack';
import { booksIn, figures } from './libraryStats';
import { inBlock, inHome } from './measured';
import { tallness } from './words';

// Everything together, the first choice of the homes' menu
const ALL = 'all';

// The first chapter: how many books there are, their pages and authors,
// and how high they'd stand stacked up: all of them, beside a block of
// flats, or (with homes in the places) one home's, beside the home drawn
// as the places draw it, chosen from the title over them as the places
// choose a home. One gives way to the other softly, the sentence and the
// drawing under it fading across, the room they take easing to fit. On
// a phone, the books drawn as a pile instead (PhoneStack). Only the
// physical books, said so plainly: those read without having them
// (`left`, how many) have nothing to stack, and count further on.
export function StackChapter({ books, left }: { books: Book[]; left: number }) {
  const homes = usePlaces().data?.homes;
  const arranged = useMemo(
    () => (homes?.length ? arrange(homes, books) : null),
    [homes, books],
  );
  const [shown, show] = useState(ALL);
  const phone = useMediaQuery(PHONE);
  const found = figures(books);
  const homeOf = (id: string) =>
    arranged?.homes.find((each) => each.home.id === id);
  // All the books, then each home, to choose between as the places choose
  // a home
  const choices = arranged && [
    {
      home: { id: ALL, name: 'All books', rooms: [] },
      count: books.length,
    },
    ...arranged.homes,
  ];

  // One into the other, the room for it easing to fit
  const switching = (render: (id: string) => ReactNode) => (
    <SmoothHeight>
      <Crossfade show={shown} render={render} />
    </SmoothHeight>
  );
  return (
    <>
      {choices && (
        <div className='mt-4'>
          <HomeTitle homes={choices} home={shown} onHome={show} start />
        </div>
      )}
      {left > 0 && (
        <p className='mt-2 text-sm text-muted'>
          Physical books only: {counted(left, 'book')} that{' '}
          {left === 1 ? 'isn’t' : 'aren’t'} physical {left === 1 ? 'is' : 'are'}{' '}
          left out.
        </p>
      )}
      {switching((id) => {
        const each = homeOf(id);
        return (
          <div className={choices ? 'pt-3' : 'pt-2.5'}>
            <p className={sayClass}>
              {each ? (
                <HomeSaying home={each} />
              ) : (
                <>
                  Stacked up, your{' '}
                  <Mark>{counted(found.books, 'physical book')}</Mark> would
                  stand <Mark>{tallness(found.height)}</Mark> tall,{' '}
                  {inBlock(found.height).words}.
                </>
              )}
            </p>
            <div className='mt-6'>
              {phone ? (
                <PhoneStack books={each ? booksIn(each) : books} />
              ) : each ? (
                <HomeSection home={each} />
              ) : (
                <BlockOfFlats books={books} />
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}

// What the books kept in one home would come up to, in it
function HomeSaying({ home }: { home: HomeBooks }) {
  if (!home.count) return <>Nothing’s kept in {home.home.name} yet.</>;
  const { height } = figures(booksIn(home));
  const rooms = home.rooms.map(({ room }) => room.name);
  return (
    <>
      Stacked up, the <Mark>{counted(home.count, 'book')}</Mark> in{' '}
      {home.home.name} would stand <Mark>{tallness(height)}</Mark> tall,{' '}
      {inHome(height, rooms).words}.
    </>
  );
}
