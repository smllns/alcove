import { useRef } from 'react';
import { cn } from '@/shared/lib/cn';
import { counted } from '@/shared/lib/plural';
import { pageScrollY, scrollPageTo } from '@/shared/lib/pageScroll';
import { usePageTurned } from '@/shared/lib/usePageTurned';
import { BackArrowIcon } from '@/shared/ui/ArrowIcon';
import { Button } from '@/shared/ui/Button';
import type { RoomBooks } from './arrange';
import type { Decor } from './decor';
import { LampLight } from './LampLight';
import { RoomDetail } from './RoomDetail';
import { RoomFloor } from './RoomFloor';
import { MiniBookcase, MiniPile } from './RoomMiniature';
import { SectionTag } from './SectionTag';
import { WallDecor } from './WallDecor';

// The letters bookcases are tagged with, one after another
const tagOf = (i: number) => String.fromCharCode(65 + (i % 26));
const detailOf = (id: string) => `bookcase-${id}`;

// One room, opened, as an architect's sheet: lit by its lamp, the light
// over the whole screen; first the whole room drawn from the front, as in
// its home's drawing, its bookcases tagged with letters; then each
// bookcase again, large, tagged the same, with the books face out on its
// shelves, and any books kept in the room but in no bookcase
export function RoomView({
  decor,
  name,
  home,
  onBack,
  units,
  loose,
  count,
}: Omit<RoomBooks, 'room'> & {
  // What it's furnished with (decor.ts)
  decor: Decor;
  name: string;
  home: string;
  onBack: () => void;
}) {
  // A tag in the drawing leads down to its bookcase's detail
  const frame = useRef<HTMLElement>(null);
  // Its lamp comes on once the room has opened (room.css)
  const lit = usePageTurned();
  const toDetail = (id: string) => {
    const detail = document.getElementById(detailOf(id));
    if (detail)
      scrollPageTo(
        pageScrollY(detail) + detail.getBoundingClientRect().top - 112,
        'smooth',
        detail,
      );
  };

  return (
    <section
      ref={frame}
      data-light={decor.lamp.light}
      data-lit={lit || undefined}
      className='room-frame relative'
    >
      <span aria-hidden className='room-wash' />
      <LampLight room={frame} />
      <div className='relative flex flex-wrap items-center gap-x-6 gap-y-4'>
        <Button variant='pill' onClick={onBack}>
          <BackArrowIcon />
          {home}
        </Button>
        <div className='flex items-baseline gap-x-4'>
          <h2 className='font-serif text-3xl tracking-[-0.03em] text-ink sm:text-4xl'>
            {name}
          </h2>
          <p className='text-sm text-muted'>{counted(count, 'book')}</p>
        </div>
      </div>

      {/* The whole room, as in the home's drawing, lit */}
      <div className='relative mx-auto mt-8 flex w-full max-w-2xl flex-col xl:max-w-4xl'>
        {/* A little in from the ends of the floor */}
        <div className='flex flex-col px-[5%]'>
          <WallDecor decor={decor} />
          <RoomFloor
            decor={decor}
            cases={units.map((unit, i) => (
              <button
                key={unit.unit.id}
                type='button'
                onClick={() => toDetail(unit.unit.id)}
                aria-label={`${unit.unit.name}: to its shelves`}
                className='case-link group flex cursor-pointer flex-col items-center gap-2 pb-4 outline-none'
              >
                <MiniBookcase {...unit} />
                <SectionTag className='transition-colors duration-700 ease-soft group-hover:bg-ink group-hover:text-surface group-focus-visible:bg-ink group-focus-visible:text-surface'>
                  {tagOf(i)}
                </SectionTag>
              </button>
            ))}
            className='mt-6 justify-center gap-8'
          >
            {loose.length > 0 && <MiniPile books={loose} />}
          </RoomFloor>
        </div>
        <div className='room-floor' />
      </div>

      {/* Then each bookcase in detail */}
      <div
        className={cn(
          'relative mt-14 grid gap-x-16 gap-y-14',
          // Side by side on a wide screen, unless there's only the one
          units.length + (loose.length ? 1 : 0) > 1 && 'lg:grid-cols-2',
        )}
      >
        {units.map(({ unit, shelves, loose: lying, count: held }, i) => (
          <RoomDetail
            key={unit.id}
            id={detailOf(unit.id)}
            tag={tagOf(i)}
            name={unit.name}
            count={held}
            shelves={[
              ...(lying.length
                ? [{ key: 'loose', name: 'Not on a shelf', books: lying }]
                : []),
              ...shelves.map(({ shelf, books }) => ({
                key: shelf.id,
                name: shelf.name,
                books,
              })),
            ]}
          />
        ))}
        {loose.length > 0 && (
          <RoomDetail
            id={detailOf('loose')}
            name={units.length ? 'Elsewhere in the room' : 'In the room'}
            count={loose.length}
            shelves={[{ key: 'loose', name: 'Not on a shelf', books: loose }]}
          />
        )}
        {!units.length && !loose.length && (
          <p className='text-sm text-muted'>Nothing kept here yet.</p>
        )}
      </div>
    </section>
  );
}
