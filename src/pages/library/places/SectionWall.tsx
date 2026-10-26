// A wall cut through, `x` along and `width` thick, from `top` down to
// `bottom`, solid, with windows in it where `windows` say (each a span
// down the wall): a gap in the cut, the frame's edges across it and two
// fine lines for the glass, as on an architect's section
export function SectionWall({
  x,
  width,
  top,
  bottom,
  windows,
}: {
  x: number;
  width: number;
  top: number;
  bottom: number;
  windows: [number, number][];
}) {
  const edges = [top, ...windows.flat(), bottom];
  return (
    <g>
      {Array.from({ length: edges.length / 2 }, (_, i) => (
        <rect
          key={i}
          x={x}
          y={edges[2 * i]}
          width={width}
          height={Math.max(0, edges[2 * i + 1] - edges[2 * i])}
          fill='var(--poche)'
        />
      ))}
      {windows.map(([from, to]) => (
        <g key={from} stroke='var(--fine)' strokeWidth='0.8'>
          <line x1={x} x2={x + width} y1={from} y2={from} />
          <line x1={x} x2={x + width} y1={to} y2={to} />
          <line x1={x + width * 0.35} x2={x + width * 0.35} y1={from} y2={to} />
          <line x1={x + width * 0.75} x2={x + width * 0.75} y1={from} y2={to} />
        </g>
      ))}
    </g>
  );
}
