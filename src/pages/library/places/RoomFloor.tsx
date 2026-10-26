import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import type { Decor } from './decor';
import { Piece } from './Piece';

// What stands along a room's floor: its bookcases (`cases`, then
// `children`), with the room's other things before them or after them,
// those after them over by the far wall, a standing lamp among them.
// In the plan of a home (`fit`), in a room only so wide, things make way
// until the rest fits, coming back
// as the room has room again: first what isn't a bookcase or the lamp,
// the last first, then the bookcases, those with the fewest books
// (`weights`) first, while more than one is left. The lamp always stays.
export function RoomFloor({
  decor,
  fit = false,
  grow = 1,
  cases = [],
  weights = [],
  className,
  children,
}: {
  decor: Decor;
  fit?: boolean;
  // How much larger its things are drawn, in the room itself
  grow?: number;
  cases?: ReactNode[];
  // How many books each bookcase holds
  weights?: number[];
  className?: string;
  children?: ReactNode;
}) {
  const floor = useRef<HTMLSpanElement>(null);
  // How many of the things that may make way are kept: the room's other
  // things, then its bookcases but the first
  const all = decor.floor.length + Math.max(0, cases.length - 1);
  const [kept, setKept] = useState(all);

  // Before it's shown: one fewer while the floor reaches past the room
  useLayoutEffect(() => {
    const row = floor.current;
    if (!fit || !row) return;
    if (row.scrollWidth > row.clientWidth + 1 && kept > 0) setKept(kept - 1);
  }, [fit, kept]);
  // Every thing again whenever the room changes size, to fit afresh
  useLayoutEffect(() => {
    const row = floor.current;
    if (!fit || !row) return;
    let width = row.clientWidth;
    const observer = new ResizeObserver(() => {
      if (row.clientWidth === width) return;
      width = row.clientWidth;
      setKept(all);
    });
    observer.observe(row);
    return () => observer.disconnect();
  }, [fit, all]);

  const lamp = !decor.lamp.hanging && (
    <Piece key='lamp' thing={decor.lamp} grow={grow} />
  );
  // The other things go first, then the bookcases
  const spare = all - decor.floor.length;
  const shown = decor.floor.slice(0, Math.max(0, kept - spare));
  // The bookcases kept, the fullest, in their own order
  const keep = new Set(
    cases
      .map((_, i) => i)
      .sort((a, b) => (weights[b] ?? 0) - (weights[a] ?? 0))
      .slice(0, 1 + Math.min(spare, kept)),
  );
  const standing = cases.filter((_, i) => keep.has(i));
  const things = (first: boolean) =>
    shown
      .filter((thing) => thing.first === first)
      .map((thing, i) => <Piece key={i} thing={thing} grow={grow} />);
  const first = decor.lamp.first;
  const after = [...things(false), !first && lamp];
  return (
    <span ref={floor} className={cn('flex items-end', className)}>
      {first && lamp}
      {things(true)}
      {standing}
      {children}
      {after.some(Boolean) && (
        <span className='ml-auto flex items-end' style={{ gap: 8 * grow }}>
          {after}
        </span>
      )}
    </span>
  );
}
