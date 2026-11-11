import type { Thing } from './decor';
import { families } from './pieces';
import type { Drawing } from './pieces/drawing';

// One thing in a room, drawn at its own size, `grow` times that in the
// room itself rather than the plan of its home
export function Piece({ thing, grow = 1 }: { thing: Thing; grow?: number }) {
  const drawing = (families[thing.family] as Record<string, Drawing>)[
    thing.look
  ];
  return (
    <svg
      aria-hidden
      viewBox={drawing.box}
      className='block shrink-0 overflow-visible'
      style={{ width: drawing.width * grow }}
    >
      {drawing.draw()}
    </svg>
  );
}
