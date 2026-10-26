import { counted } from '@/shared/lib/plural';
import { WALL } from './section';

// What's drawn under a section through a home, as under an architect's
// drawing: the ground it stands on, hatched, a line under that ticked at
// every wall (`walls`, along it) downstairs, a scale bar in one corner and
// the title block in the other: the home's name, its rooms and books.
// `width`: the house's; `ground`: how far down the ground is.

const label = {
  fill: 'var(--muted)',
  fontSize: 8.5,
  letterSpacing: '0.16em',
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
        fontSize='8'
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
        <text y='14'>0</text>
        <text x='47' y='14'>
          1
        </text>
        <text x='72' y='14'>
          2 m
        </text>
      </g>
      <g transform={`translate(${w - 232} ${under + 18})`}>
        <rect
          width='232'
          height='36'
          fill='none'
          stroke='var(--fine)'
          strokeWidth='0.6'
        />
        <line
          x1='132'
          x2='132'
          y2='36'
          stroke='var(--fine)'
          strokeWidth='0.6'
        />
        <text x='10' y='21.5' {...label} fill='var(--ink)' fontSize='9'>
          {name.toUpperCase().slice(0, 22)}
        </text>
        <text x='142' y='15' {...label}>
          {counted(rooms, 'ROOM', 'ROOMS')}
        </text>
        <text x='142' y='28' {...label}>
          {counted(books, 'BOOK', 'BOOKS')}
        </text>
      </g>
    </>
  );
}
