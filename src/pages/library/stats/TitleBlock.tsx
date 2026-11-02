// What's written under a drawing, as under an architect's: a scale bar of
// three metres (`metre` units each) on the left, and on the right the
// title block, a ruled box of what's drawn in figures
export function TitleBlock({
  y,
  width,
  metre,
  figures,
}: {
  y: number;
  width: number;
  metre: number;
  figures: [string, number][];
}) {
  const box = Math.min(420, width - 3 * metre - 30);
  const cell = box / figures.length;
  const left = width - box;
  return (
    <g>
      <g transform={`translate(0 ${y + 16})`} fill='var(--fine)'>
        {[0, 1, 2].map((m) => (
          <rect
            key={m}
            x={m * metre}
            width={metre}
            height='3'
            fill={m === 1 ? 'none' : undefined}
            stroke={m === 1 ? 'var(--fine)' : undefined}
            strokeWidth='0.6'
          />
        ))}
        {['0', '1', '2', '3 m'].map((label, m) => (
          <text
            key={label}
            x={m * metre - (m ? 3 : 0)}
            y='14'
            className='text-[8px]'
            fontFamily='ui-monospace, Menlo, monospace'
          >
            {label}
          </text>
        ))}
      </g>
      <g stroke='var(--fine)' strokeWidth='0.6' fill='none'>
        <rect x={left} y={y} width={box} height='38' />
        {figures.slice(1).map((_, i) => (
          <line
            key={i}
            x1={left + (i + 1) * cell}
            x2={left + (i + 1) * cell}
            y1={y}
            y2={y + 38}
          />
        ))}
      </g>
      {figures.map(([name, value], i) => (
        <g key={name}>
          <text
            x={left + i * cell + 10}
            y={y + 14}
            className='fill-muted text-[7.5px] tracking-[0.18em] uppercase'
          >
            {name}
          </text>
          <text
            x={left + i * cell + 10}
            y={y + 30}
            className='fill-ink font-serif text-[14px]'
          >
            {value.toLocaleString('en')}
          </text>
        </g>
      ))}
    </g>
  );
}
