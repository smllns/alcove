import { counted } from '@/shared/lib/plural';
import { WALL } from '@/shared/ui/drawing/section';

// What's drawn under a section through a home, as under an architect's
// drawing: the ground it stands on, hatched, a line under that ticked at
// every wall (`walls`, along it) downstairs, a scale bar in one corner and
// the title block in the other: the home's name, its rooms and books.
// `width`: the house's; `ground`: how far down the ground is. Drawn at
// the screen's own scale, so its words are 12px, as small as any text in
// alcove gets.

const label = {
  fill: 'var(--muted)',
  fontSize: 12,
  letterSpacing: '0.14em',
} as const;
const figures = 'ui-monospace, Menlo, monospace';

export function SectionNotes({
  width: w,
  ground,
  walls,
  name,
  rooms,
  books,
}: {
  width: number;
  ground: number;
  walls: number[];
  name: string;
  rooms: number;
  books: number;
}) {
  const under = ground + 46;
  // The title block as wide as it can be beside the scale bar, the name
  // taking the larger part, cut to the letters that fit (12px capitals,
  // spaced, take about 9.5 each)
  const box = Math.min(300, w - 110);
  const split = Math.round(box * 0.58);
  const letters = Math.floor((split - 24) / 9.5);
  return (
    <>
      {/* The ground */}
      <rect
        x={-WALL - 40}
        y={ground}
        width={w + 2 * WALL + 80}
        height='24'
        fill='url(#section-hatch)'
      />
      <line
        x1={-WALL - 40}
        x2={w + WALL + 40}
        y1={ground}
        y2={ground}
        stroke='var(--poche)'
        strokeWidth='1.2'
      />
      {/* A line under it, ticked at every wall downstairs */}
      <line
        x1='0'
        x2={w}
        y1={under}
        y2={under}
        stroke='var(--fine)'
        strokeWidth='0.6'
      />
      {[...new Set(walls)].map((x) => (
        <line
          key={x}
          x1={x - 4}
          x2={x + 4}
          y1={under + 4}
          y2={under - 4}
          stroke='var(--fine)'
          strokeWidth='0.8'
        />
      ))}
      {/* A scale bar, and the title block */}
      <g
        transform={`translate(0 ${under + 30})`}
        fill='var(--fine)'
        fontSize='12'
        fontFamily={figures}
      >
        <rect width='25' height='3' />
        <rect
          x='25'
          width='25'
          height='3'
          fill='none'
          stroke='var(--fine)'
          strokeWidth='0.6'
        />
        <rect x='50' width='25' height='3' />
        <text y='17'>0</text>
        <text x='50' y='17' textAnchor='middle'>
          1
        </text>
        <text x='71' y='17'>
          2 m
        </text>
      </g>
      <g transform={`translate(${w - box} ${under + 18})`}>
        <rect
          width={box}
          height='48'
          fill='none'
          stroke='var(--fine)'
          strokeWidth='0.6'
        />
        <line
          x1={split}
          x2={split}
          y2='48'
          stroke='var(--fine)'
          strokeWidth='0.6'
        />
        <text x='12' y='28.5' {...label} fill='var(--ink)'>
          {name.toUpperCase().slice(0, letters)}
        </text>
        <text x={split + 12} y='20' {...label}>
          {counted(rooms, 'ROOM', 'ROOMS')}
        </text>
        <text x={split + 12} y='37' {...label}>
          {counted(books, 'BOOK', 'BOOKS')}
        </text>
      </g>
    </>
  );
}
