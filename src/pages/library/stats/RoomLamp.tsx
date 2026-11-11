import type { Decor } from '@/shared/ui/drawing/decor';
import { hangingLamp, roomOutline } from './drawingKit';

// A room's lamp as the places furnish it (decor.ts), drawn with their
// own lamps, always hanging from the ceiling on a cord of its length
// (hangingLamp), somewhere along it, or where it's told (`at`; none at
// all, `null`, only its light). Lit (`light`: the colour, places.css), its
// shade fills and its bulb shows as a room's does pointed at, its light
// pools round it and fills its `room` (an outline), its own shades of
// that light named after `id`.
export function RoomLamp({
  id,
  lamp,
  room,
  size,
  light,
  outline = roomOutline(room.x, room.y, room.width, room.height),
  clear = room.x + room.width * 0.4,
  at,
}: {
  id: string;
  lamp: Decor['lamp'];
  room: { x: number; y: number; width: number; height: number };
  size: number;
  light?: string;
  // The room's shape, if not its box (an attic, under its roof)
  outline?: string;
  // Where the wall is clear of what's written on it, for the lamp to hang
  // somewhere past
  clear?: number;
  at?: number | null;
}) {
  const { drawing, wide, tall, cord } = hangingLamp(lamp, id, size);
  const top = room.y + cord;
  // Along the wall clear of the room's number and name
  const free = room.x + room.width - 16 - wide / 2 - clear;
  const x =
    at ??
    (at === null
      ? room.x + room.width / 2
      : clear + Math.max(0, free) * (lamp.hanging ? lamp.at : 0.6));
  const glow = top + tall + 40 * size;
  return (
    <g data-light={light} className={light ? 'stats-lit' : undefined}>
      {light && (
        <>
          <defs>
            <radialGradient id={`${id}p`}>
              <stop offset='0' stopColor='var(--light)' />
              <stop offset='1' stopColor='var(--light)' stopOpacity='0' />
            </radialGradient>
            {/* Its light kept to the room it's in */}
            <clipPath id={`${id}c`}>
              <path d={outline} />
            </clipPath>
            <linearGradient id={`${id}l`} x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0' stopColor='var(--light)' />
              <stop offset='1' stopColor='var(--light)' stopOpacity='0.3' />
            </linearGradient>
          </defs>
          <path d={outline} fill={`url(#${id}l)`} />
          <ellipse
            cx={x}
            cy={glow}
            rx={72 * size}
            ry={62 * size}
            fill={`url(#${id}p)`}
            clipPath={`url(#${id}c)`}
          />
        </>
      )}
      {at !== null && (
        <>
          <line
            x1={x}
            x2={x}
            y1={room.y}
            y2={top}
            stroke='var(--fine)'
            strokeWidth='0.8'
          />
          <svg
            x={x - wide / 2}
            y={top}
            width={wide}
            height={tall}
            viewBox={drawing.box}
            overflow='visible'
          >
            {drawing.draw()}
          </svg>
        </>
      )}
    </g>
  );
}
