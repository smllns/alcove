import { BLOCK_STOREYS, PARAPET, STOREY } from './measured';
import { FLAT, G, M, STAIR, TALL, WALL, WIDE, X } from './blockMeasures';
import { WallWindow } from './drawing';

// What's cut through solid: the floors, the walls either side of the
// stair, the outer walls with a window to each storey, the flat roof's
// parapet
export function BlockCut() {
  const top = G - TALL - PARAPET * M;
  return (
    <g fill='var(--poche)'>
      {[X - WALL, X + WIDE].map((x) => (
        <rect key={x} x={x} y={top} width={WALL} height={G - top} />
      ))}
      {Array.from({ length: BLOCK_STOREYS }, (_, f) => {
        const ceiling = G - (f + 1) * STOREY * M;
        const window = [ceiling + STOREY * M * 0.3, STOREY * M * 0.4];
        return (
          <g key={f}>
            <rect
              x={X - WALL}
              y={ceiling - 3.5}
              width={WIDE + 2 * WALL}
              height='7'
            />
            <rect
              x={X + FLAT - 1.2}
              y={ceiling}
              width='2.4'
              height={STOREY * M}
            />
            <rect
              x={X + FLAT + STAIR - 1.2}
              y={ceiling}
              width='2.4'
              height={STOREY * M}
            />
            {[X - WALL, X + WIDE].map((x) => (
              <WallWindow key={x} x={x} y={window[0]} tall={window[1]} />
            ))}
          </g>
        );
      })}
      <rect x={X - WALL} y={top} width={WIDE + 2 * WALL} height='4' />
    </g>
  );
}

// A flight of stairs up a storey, turning back on the next
export function Stair({ floor, up }: { floor: number; up: boolean }) {
  const steps = 9;
  let path = `M${X + FLAT + (up ? 0 : STAIR)} ${floor}`;
  for (let i = 1; i <= steps; i++) {
    const across = (STAIR * i) / steps;
    path += `V${floor - (STOREY * M * i) / steps}H${X + FLAT + (up ? across : STAIR - across)}`;
  }
  return (
    <path
      d={path}
      fill='none'
      stroke='var(--fine)'
      strokeWidth='0.7'
      opacity='0.8'
    />
  );
}
