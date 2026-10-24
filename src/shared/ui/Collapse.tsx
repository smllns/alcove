import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

// How long opening and closing take, for anyone waiting on it to finish
export const COLLAPSE_MS = 700;
// Something arriving on its own (`arriving`): its room opens over this
// long, evenly; what's in it fades in a little after the room has begun
// to open, and goes before the room closes
const ROOM_MS = 800;
const EVEN = 'cubic-bezier(0.45, 0, 0.2, 1)';

// Smoothly opens and closes to its content's natural height. Closed content
// is inert, so it can't be tabbed into. With `appear`, it opens on mount
// instead of starting open, so a newly added item grows into place. Only
// while it moves is its content cut to its edges: once open and still,
// what reaches out (a button on a corner, a tooltip) shows whole.
// `arriving`: for what opens of itself, not at a click (a part of the page
// that's come in later than the page): first the page makes room for it,
// evenly, starting as gently as it ends; then it shows in that room,
// fading in as it settles a touch up into place. Closing, the other way
// round.
export function Collapse({
  open,
  appear = false,
  arriving = false,
  children,
}: {
  open: boolean;
  appear?: boolean;
  arriving?: boolean;
  children: ReactNode;
}) {
  const [entered, setEntered] = useState(!appear);
  useEffect(() => {
    if (entered) return;
    // Two frames: one to paint it closed, the next to start opening
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setEntered(true));
    });
    return () => cancelAnimationFrame(frame);
  }, [entered]);
  const shown = open && entered;
  // Open and done opening
  const [settled, setSettled] = useState(shown);
  if (settled && !shown) setSettled(false);

  return (
    <div
      // Out of reach once closing or closed; opening, already in reach, so
      // what appears can take the cursor at once
      inert={!open}
      style={
        arriving
          ? {
              transition: `grid-template-rows ${ROOM_MS}ms ${EVEN} ${shown ? 0 : 200}ms`,
            }
          : { transitionDuration: `${COLLAPSE_MS}ms` }
      }
      onTransitionEnd={(e) => {
        if (e.target === e.currentTarget && shown) setSettled(true);
      }}
      className={cn(
        // One column as wide as the room, not as its content: a row inside
        // that scrolls sideways (a phone's row of books) stays in the room
        // and scrolls, rather than stretching off the screen
        'grid grid-cols-1',
        shown ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        !arriving && 'transition-all ease-soft',
        !arriving && (shown ? 'opacity-100' : 'opacity-0'),
      )}
    >
      <div
        className={cn(
          'min-h-0',
          !settled && 'overflow-hidden',
          arriving && 'transition-[opacity,translate]',
          arriving &&
            (shown
              ? 'translate-y-0 opacity-100 delay-250 duration-600 ease-out'
              : 'translate-y-1.5 opacity-0 duration-200 ease-in'),
        )}
      >
        {children}
      </div>
    </div>
  );
}
