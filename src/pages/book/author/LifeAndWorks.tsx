import { useLayoutEffect, useRef, useState } from 'react';
import { HOVER, useMediaQuery } from '@/shared/lib/useMediaQuery';
import { TitledSection } from '@/shared/ui/TitledSection';
import { LifeBook } from './LifeBook';
import { LifeBookDrawer } from './LifeBookDrawer';
import { LifeRuler } from './LifeRuler';
import { pinRows, rulerSpan, type LifePin } from './writerBooks';

// A book on the line: its cover's width, how near the next may come (a
// little over it, as cards fanned out), and how many rows they may take,
// a book with no room in any going where it covers least. Smaller and
// closer where the page is narrower than NARROW (a phone), so they all
// fit across it.
const NARROW = 640;
const SIZES = {
  wide: { pin: 36, near: 24, rows: 2 },
  narrow: { pin: 26, near: 14, rows: 3 },
};
// Room over the top row for a book's name as it's pointed at, and under
// the line for its years; how near an end of the line a book's name runs
// inwards from it; and the room kept at its ends, for the years named there
const TOP = 34;
const UNDER = 36;
const CAPTION = 120;
const EDGE = 32;

// The writer's books along their life, from their birth to their death
// (or to now; on a phone, across their books' years alone), each where it
// first came out, raised over those it would cover, all of them across
// the page (LifeBook). Over the line, how many the reader has and has
// read, a mark for each book. On a touch screen, a book tapped is shown in
// a drawer first (LifeBookDrawer).
export function LifeAndWorks({
  pins,
  born,
  died,
}: {
  pins: LifePin[];
  born?: number;
  died?: number;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  // Measured before it's first drawn, so the books are never moved after
  useLayoutEffect(() => {
    const element = box.current;
    if (!element) return;
    const measure = () => setWidth(element.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const touch = !useMediaQuery(HOVER);
  const [tapped, setTapped] = useState<LifePin | null>(null);
  const [open, setOpen] = useState(false);

  const narrow = width < NARROW;
  const { pin: size, near, rows: most } = SIZES[narrow ? 'narrow' : 'wide'];
  const row = size * 1.5 + 8;
  const span = rulerSpan(pins, born, died, narrow);
  const x = (year: number) =>
    EDGE + ((year - span.from) / (span.to - span.from)) * (width - 2 * EDGE);
  // Where each book's middle is along the line
  const at = pins.map((pin) => x(pin.year));
  const rows = pinRows(
    at.map((middle) => middle - size / 2),
    near,
    most,
  );
  const height = TOP + (Math.max(...rows) + 1) * row + UNDER;
  const have = pins.filter((pin) => pin.bookId);

  return (
    <TitledSection title='Life and works'>
      <p className='font-serif text-lg text-ink-soft'>
        You have <span className='text-ink'>{have.length}</span> of these{' '}
        {pins.length}
        {have.length > 0 && (
          <>
            {' · '}
            <span className='text-ink'>
              {have.filter((pin) => pin.read).length}
            </span>{' '}
            read
          </>
        )}
      </p>
      <div aria-hidden className='mt-2.5 flex max-w-md gap-[3px]'>
        {pins.map((pin) => (
          <i
            key={pin.key}
            className='h-1.5 flex-1 rounded-full'
            style={{
              background: pin.read
                ? 'var(--read)'
                : pin.bookId
                  ? 'var(--accent)'
                  : 'var(--line)',
            }}
          />
        ))}
      </div>
      <div ref={box} className='mt-2'>
        {width > 0 && (
          <ul className='relative' style={{ height }}>
            <LifeRuler span={span} x={x} under={UNDER} />
            {pins.map((pin, i) => (
              <LifeBook
                key={pin.key}
                pin={pin}
                left={at[i] - size / 2}
                bottom={UNDER + rows[i] * row}
                width={size}
                side={
                  at[i] < CAPTION
                    ? 'start'
                    : at[i] > width - CAPTION
                      ? 'end'
                      : 'middle'
                }
                onTap={
                  touch
                    ? () => {
                        setTapped(pin);
                        setOpen(true);
                      }
                    : undefined
                }
              />
            ))}
          </ul>
        )}
      </div>
      {touch && (
        <LifeBookDrawer
          open={open}
          pin={tapped}
          onClose={() => setOpen(false)}
        />
      )}
    </TitledSection>
  );
}
