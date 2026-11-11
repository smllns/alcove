import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import type { Decor } from './decor';
import { Piece } from './Piece';

// The top of a room's wall: what's written there (`children`, the room's
// number and name), a picture hanging towards the right wall, and a
// hanging lamp somewhere in between, on a cord of its own length,
// its light (.room-glow) coming on when the room is pointed at. However
// narrow the room, nothing hangs over anything else.
export function WallDecor({
  decor,
  grow = 1,
  children,
}: {
  decor: Decor;
  // How much larger it's all drawn, in the room itself
  grow?: number;
  children?: ReactNode;
}) {
  const { lamp } = decor;
  return (
    <span className='relative flex items-start'>
      {children}
      <span aria-hidden style={{ flexGrow: lamp.at }} className='min-w-4' />
      {lamp.hanging && (
        <span
          aria-hidden
          className='relative flex shrink-0 flex-col items-center'
        >
          <span className='room-glow pendant-glow' />
          <span
            className='w-px bg-(--fine)'
            style={{ height: (4 + lamp.drop * 24) * 1.1 * grow }}
          />
          <span className='relative'>
            <Piece thing={lamp} grow={grow} />
          </span>
        </span>
      )}
      <span aria-hidden style={{ flexGrow: 1 - lamp.at }} className='min-w-4' />
      <span
        aria-hidden
        // Over the lamp's light
        className='relative flex shrink-0 items-start'
        style={{ gap: 16 * grow, marginTop: 34 * grow }}
      >
        {decor.wall.map((thing, i) => (
          // A narrow room has room for only the one
          <span
            key={thing.family}
            className={cn(i > 0 && '@max-[21rem]:hidden')}
          >
            <Piece thing={thing} grow={grow} />
          </span>
        ))}
      </span>
    </span>
  );
}

// A standing lamp's light, spreading through the room from the end of the
// floor it stands at; drawn by the room rather than the lamp, so no part
// of the room clips it
export function RoomLight({ decor }: { decor: Decor }) {
  if (decor.lamp.hanging) return null;
  return (
    <span
      aria-hidden
      className='room-glow standing-glow'
      style={{ left: decor.lamp.first ? '10%' : '90%' }}
    />
  );
}
