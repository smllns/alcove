import { WALL, type Ids } from './drawingKit';

// The pieces the stats' sections through a building are drawn with, as
// the places draw a home (places.css): what's cut through solid, the
// ground hatched, everything else in a fine line, only the books and the
// light in colour

export function SectionDefs({ ids }: { ids: Ids }) {
  return (
    <defs>
      <pattern
        id={ids.hatch}
        width='7'
        height='7'
        patternUnits='userSpaceOnUse'
        patternTransform='rotate(45)'
      >
        <line y2='7' stroke='var(--hatch)' />
      </pattern>
    </defs>
  );
}

// The ground, hatched under a solid line
export function Ground({
  ids,
  from,
  to,
  y,
}: {
  ids: Ids;
  from: number;
  to: number;
  y: number;
}) {
  return (
    <>
      <rect
        x={from}
        y={y}
        width={to - from}
        height='18'
        fill={`url(#${ids.hatch})`}
      />
      <line x1={from} x2={to} y1={y} y2={y} stroke='var(--poche)' />
    </>
  );
}

// A level marked as on an architect's section: a small triangle on the
// line, the height by it and what's there under that; gold, the stack's
export function LevelMark({
  x,
  y,
  value,
  name,
  gold,
}: {
  x: number;
  y: number;
  value: string;
  name?: string;
  gold?: boolean;
}) {
  const colour = gold ? 'var(--gold)' : 'var(--fine)';
  return (
    <g>
      <path
        d={`M${x - 6} ${y - 8}H${x + 6}L${x} ${y}Z`}
        fill={gold ? colour : 'none'}
        stroke={colour}
        strokeWidth='0.9'
      />
      <text x={x + 11} y={y - 1} className='fill-ink font-serif text-[11px]'>
        {value}
      </text>
      {name && (
        <text
          x={x + 11}
          y={y + 11}
          className='fill-muted text-[9px] tracking-[0.03em]'
        >
          {name}
        </text>
      )}
    </g>
  );
}

// A window cut through an outer wall at `x`: the opening, its sill and
// head, and the glass between
export function WallWindow({
  x,
  y,
  tall,
}: {
  x: number;
  y: number;
  tall: number;
}) {
  return (
    <g>
      <rect x={x} y={y} width={WALL} height={tall} fill='var(--bg-mid)' />
      <path
        d={`M${x} ${y}h${WALL}M${x} ${y + tall}h${WALL}M${x + WALL / 2} ${y}v${tall}`}
        stroke='var(--fine)'
        strokeWidth='0.6'
      />
    </g>
  );
}
