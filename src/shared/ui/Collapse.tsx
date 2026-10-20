import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

// How long opening and closing take, for anyone waiting on it to finish
export const COLLAPSE_MS = 700;

// Smoothly opens and closes to its content's natural height. Closed content
// is inert, so it can't be tabbed into. With `appear`, it opens on mount
// instead of starting open, so a newly added item grows into place.
export function Collapse({
  open,
  appear = false,
  children,
}: {
  open: boolean;
  appear?: boolean;
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

  return (
    <div
      inert={!shown}
      style={{ transitionDuration: `${COLLAPSE_MS}ms` }}
      className={cn(
        'grid transition-all ease-soft',
        shown ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
      )}
    >
      <div className='min-h-0 overflow-hidden'>{children}</div>
    </div>
  );
}
