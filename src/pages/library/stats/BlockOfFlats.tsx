import type { Book } from '@/entities/book/types';
import { seedOf } from '@/shared/lib/seed';
import { furnish } from '@/shared/ui/drawing/decor';
import { BlockCut, Stair } from './BlockCut';
import {
  BASE,
  FLAT,
  G,
  M,
  MARKS,
  STAIR,
  SW,
  SX,
  TALL,
  WALL,
  WIDE,
  X,
} from './blockMeasures';
import { BlockFlat } from './BlockFlat';
import { BookStack } from './BookShapes';
import { Ground, LevelMark, SectionDefs } from './drawing';
import { UNDER, useDrawingIds } from './drawingKit';
import { figures, stacked, stampOf } from './libraryStats';
import { BLOCK_STOREYS, PARAPET, STOREY, inBlock, ordinal } from './measured';
import { TitleBlock } from './TitleBlock';
import { useDrawingWidth } from './useDrawingWidth';

// Every flat furnished as the places furnish a room, for its lamp: lit
// on the floor the stack comes up to, and in a few flats up and down the
// block besides, each its own colour, as windows are of an evening
const flats = [
  ...furnish(
    Array.from({ length: BLOCK_STOREYS * 2 }, (_, i) => `flat:${i}`),
  ).values(),
];

// All the reader's books stacked up beside a block of flats, the measure
// of them: six storeys of two flats either side of the stair, drawn in
// section as the places draw a home, each flat with a lamp and a bookcase
// of the reader's books, a few lit. The floor the stack comes up to lights
// up; the storeys are carried across to it as levels, its own height in
// gold.
// Taller than will fit, the stack is broken off, its level still true.
export function BlockOfFlats({ books }: { books: Book[] }) {
  const ids = useDrawingIds();
  // Wider on a wide column: the levels' marks at its right, the stack
  // midway between them and the block
  const { svg, width } = useDrawingWidth(BASE);
  const marks = MARKS + (width - BASE);
  const sx = width > BASE ? (X + WIDE + WALL + marks - SW) / 2 : SX;
  const stack = stacked(books, M, TALL + 2 * M);
  const found = figures(books);
  const height = stack.tall / M;
  const { storey: lit } = inBlock(height);
  const top = G - stack.drawn;
  const roof = G - TALL - PARAPET * M;
  const first = Math.min(roof, top) - 24;
  // The reader's books, a few to each flat's shelves, over and over
  const shelfOf = (flat: number, shelf: number) => {
    const from = ((flat * 10 + shelf) * 7) % Math.max(books.length, 1);
    return books.slice(from, from + 7);
  };

  return (
    <svg
      ref={svg}
      viewBox={`0 ${first} ${width} ${G + UNDER - first}`}
      role='img'
      aria-label={`All the books stacked up, ${height.toFixed(1)} metres tall, beside a six-storey block of flats`}
      className='block w-full overflow-visible'
    >
      <SectionDefs ids={ids} />
      {Array.from({ length: BLOCK_STOREYS }, (_, f) => {
        const floor = G - f * STOREY * M;
        const ceiling = floor - STOREY * M;
        return (
          <g key={f}>
            {[X, X + FLAT + STAIR].map((x, side) => (
              <g key={x}>
                <BlockFlat
                  ids={ids}
                  n={f * 2 + side}
                  x={x}
                  floor={floor}
                  decor={flats[f * 2 + side]}
                  books={(shelf) => shelfOf(f * 2 + side, shelf)}
                  lit={f === lit || seedOf(`flat:${f * 2 + side}`) < 0.3}
                />
              </g>
            ))}
            <Stair floor={floor} up={f % 2 === 0} />
            <text
              x={X - 16}
              y={ceiling + (STOREY * M) / 2 + 3}
              textAnchor='end'
              className={`text-[9px] tracking-[0.15em] uppercase ${f === lit ? 'fill-ink' : 'fill-muted'}`}
            >
              {ordinal(f)}
            </text>
          </g>
        );
      })}
      <BlockCut />
      <Ground ids={ids} from={10} to={width - 10} y={G} />
      <TitleBlock y={G + 34} width={width} metre={M} figures={stampOf(found)} />
      <BookStack books={books} x={sx} width={SW} ground={G} {...stack} />
      {[0, 2, 4, 6].map((f) => {
        const y = G - f * STOREY * M;
        const gap = G - stack.drawn * 0.62;
        if (Math.abs(y - top) < 18 || (stack.broken && y < gap + 8))
          return null;
        return (
          <g key={f}>
            {f > 0 && (
              <line
                x1={X + WIDE + WALL + 6}
                x2={marks - 8}
                y1={y}
                y2={y}
                stroke='var(--fine)'
                strokeDasharray='2 4'
                opacity='0.45'
              />
            )}
            <LevelMark
              x={marks}
              y={y}
              value={`${f * STOREY} m`}
              name={
                f === BLOCK_STOREYS
                  ? 'the roof'
                  : f
                    ? `${ordinal(f)} floor`
                    : undefined
              }
            />
          </g>
        );
      })}
      <line
        x1={lit === null ? sx - 8 : X + WIDE + WALL + 6}
        x2={marks - 8}
        y1={top}
        y2={top}
        stroke='var(--gold)'
        strokeDasharray={lit === null ? undefined : '3 3'}
      />
      <LevelMark x={marks} y={top} value={`${height.toFixed(2)} m`} gold />
    </svg>
  );
}
