import type { Bounds } from './layout';

// How far past the books the veil reaches, in the sky's own pixels: past
// what the screen shows of the sky at its smallest
const REACH = 8000;

// A veil of the paper's colour over the sky, under the book pointed at and
// its writer's other books (universe.css), coming on as one is pointed at,
// so the rest of the sky dims behind them: the one layer faded, rather than
// every book on its own, which had the page redraw them all at every step
export function SkyVeil({ bounds }: { bounds: Bounds }) {
  return (
    <div
      aria-hidden
      className='sky-veil'
      style={{
        left: bounds.minX - REACH,
        top: bounds.minY - REACH,
        width: bounds.maxX - bounds.minX + 2 * REACH,
        height: bounds.maxY - bounds.minY + 2 * REACH,
      }}
    />
  );
}
