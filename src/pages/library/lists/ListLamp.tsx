import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import type { Book } from '@/entities/book/types';
import { spineSize } from '@/entities/book/spine';
import { MiniSpine } from '@/entities/book/ui/MiniSpine';
import { cn } from '@/shared/lib/cn';
import { counted } from '@/shared/lib/plural';
import { usePageTurned } from '@/shared/lib/usePageTurned';
import { LampMeasure, MEASURE_TOP } from './LampMeasure';
import { leanClass, leanOf } from './pileLean';

// A book of the list's still to come, drawn plain till it's here
const TO_COME = 'to-come-';
const toCome = (i: number): Book => ({
  id: `${TO_COME}${i}`,
  title: '',
  authors: [],
  createdAt: '',
  updatedAt: '',
});

// The round numbers a measure goes up to: never under 20, so a short list's
// books stay as thick as books are, its pile short
const TOPS = [20, 50, 100, 200, 500, 1000, 2000];
// The most books drawn in the pile: past that, each stands for a few
const DRAWN = 120;
// How thin a book in the pile is drawn, at least: on a short lamp (a
// phone's) a long list's books each stand for a few, so none's too thin to
// see
const THINNEST = 4;

// A list's pile on the floor by a standing lamp from the rooms, its pole
// marked as a measure, as a child against a doorframe: one book to a
// step, the measure's top the next round number past the list, and a mark
// at how many are `marked` (on the reader's shelves, say), those lying at
// the bottom and the rest paler above them. Under the floor, how many
// books there are in all, and in `tone` how many are marked, with
// `label`. The lamp's light is the page's (ListFrame), coming on as a
// room's lamp does once the page has opened, and its books are there
// (not `waiting` for them). Pointed at, the pile loosens a touch, as the
// lists' piles do (pileLean).
export function ListLamp({
  books,
  marked,
  label,
  tone,
  waiting = false,
  total = books.length,
}: {
  books: Book[];
  // How many it holds, when not all its books are here yet: the rest are
  // drawn too, in no colour till they come
  total?: number;
  waiting?: boolean;
  marked: (book: Book) => boolean;
  label: string;
  tone: string;
}) {
  const lit = usePageTurned() && !waiting;
  // How tall the pile may be, from the floor to the shade
  const room = useRef<HTMLDivElement>(null);
  const [tall, setTall] = useState<number>();
  useLayoutEffect(() => {
    const el = room.current;
    if (!el) return;
    const measure = () => setTall(el.clientHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const size = Math.max(total, books.length);
  const top = TOPS.find((n) => n >= size) ?? size;
  // Where `n` books come to on the measure, from the floor up
  const at = (n: number) => `${(n / top) * 100}%`;
  // Marked first, so they lie at the bottom
  const own = books.filter(marked);
  const all = [
    ...own,
    ...books.filter((b) => !marked(b)),
    ...Array.from({ length: size - books.length }, (_, i) => toCome(i)),
  ];
  const fits = tall
    ? Math.max(1, Math.floor(((size / top) * tall) / THINNEST))
    : DRAWN;
  const drawn = Math.min(DRAWN, fits);
  const pile = all.filter((_, i) => i % Math.ceil(all.length / drawn) === 0);
  const each = size / Math.max(pile.length, 1);
  const count = own.length;
  // Quarters, or fifths where quarters wouldn't be whole (of 50, say)
  const parts = top % 4 ? 5 : 4;
  const ticks = Array.from(
    { length: parts },
    (_, i) => (top / parts) * (i + 1),
  );

  return (
    <div
      data-lit={lit || undefined}
      // Shorter on a short wide screen, for the ways to change the list
      // and look in it under it to stay in sight with it (ListFrame)
      className='list-lamp group relative mx-auto h-56 w-full max-w-64 sm:h-[25rem] lg:h-[clamp(14rem,calc(100dvh-30rem),25rem)] xl:h-[clamp(14rem,calc(100dvh-21rem),25rem)]'
      aria-hidden
    >
      <div className='absolute inset-x-0 bottom-11 top-0 flex gap-3 pl-7'>
        <LampMeasure ticks={ticks} at={at} />
        {/* The pile, a book to a step, from the floor up to the lamp's
            shade at most, and how many are marked: a line across, at
            their height */}
        <div className='relative flex-1'>
          <div
            ref={room}
            className='absolute inset-x-0 bottom-0 flex flex-col-reverse items-center'
            style={{ top: MEASURE_TOP }}
          >
            {pile.map((book, i) => (
              <span
                key={book.id}
                className={cn(
                  'block',
                  leanClass,
                  !book.id.startsWith(TO_COME) && !marked(book) && 'opacity-55',
                )}
                style={{
                  height: at(each),
                  paddingTop: 1,
                  ...leanOf(book.id, i, pile.length),
                }}
              >
                {book.id.startsWith(TO_COME) ? (
                  <span
                    className='list-spine block h-full rounded-[1px]'
                    style={
                      {
                        width: Math.round(spineSize(book).height * 1.04),
                        '--tone': 'var(--spine-pending)',
                      } as CSSProperties
                    }
                  />
                ) : (
                  <MiniSpine
                    book={book}
                    lying
                    grow={2.6}
                    className='list-spine h-full!'
                    pending='var(--spine-pending)'
                  />
                )}
              </span>
            ))}
            {count > 0 && (
              <span
                className='absolute -left-3 right-0 border-t-2 border-dashed'
                style={{ bottom: at(count), borderColor: tone }}
              />
            )}
          </div>
        </div>
      </div>
      {/* Under the floor, how many there are in all, and how many marked:
          a word on what the line is, whatever its length */}
      <div
        className={cn(
          'absolute inset-x-0 bottom-0 flex h-5 items-center justify-between gap-3 whitespace-nowrap text-[11px] font-medium transition-opacity duration-700 ease-soft',
          waiting && 'opacity-0',
        )}
      >
        <span className='flex items-center gap-1.5 text-ink-soft'>
          <span className='h-1.5 w-3.5 rounded-[1px] bg-ink-soft' />
          {counted(size, 'book')}
        </span>
        {/* Said even when none are */}
        <span className='flex items-center gap-1.5' style={{ color: tone }}>
          <span
            className='w-4 border-t-2 border-dashed'
            style={{ borderColor: tone }}
          />
          {count.toLocaleString('en')} {label}
        </span>
      </div>
      {/* The floor, cut through as in the drawing of a home: a slab, the
          ground hatched under it */}
      <div className='room-floor absolute inset-x-0 bottom-6 mx-0!' />
    </div>
  );
}
