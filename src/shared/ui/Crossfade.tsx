import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

// How long the one shown before takes to fade out, and then the new one
// to fade in: one after the other, never showing through each other
const OUT_MS = 260;
const IN_MS = 500;

// One of several things, shown by `show`: changed to another, the one
// before fades out where it was as the new one fades in over it, rather
// than the one simply replacing the other. Only the new one takes room;
// to ease the room it takes, set it in a SmoothHeight.
export function Crossfade<K extends string>({
  show,
  render,
  className,
}: {
  show: K;
  render: (shown: K) => ReactNode;
  className?: string;
}) {
  const [was, setWas] = useState(show);
  const [leaving, setLeaving] = useState<K | null>(null);
  if (was !== show) {
    setWas(show);
    setLeaving(was);
  }
  useEffect(() => {
    if (leaving === null) return;
    const done = window.setTimeout(() => setLeaving(null), OUT_MS + IN_MS + 50);
    return () => window.clearTimeout(done);
  }, [leaving]);

  return (
    <div className={cn('relative', className)}>
      {leaving !== null && (
        <div
          key={leaving}
          inert
          className='pointer-events-none absolute inset-x-0 top-0 flow-root animate-fade-out'
          style={{ animationDuration: `${OUT_MS}ms` }}
        >
          {render(leaving)}
        </div>
      )}
      <div
        key={show}
        // Its own box, so a margin inside doesn't leak out of it unmeasured
        className={cn('flow-root', leaving !== null && 'animate-fade-in')}
        style={
          leaving !== null
            ? {
                animationDuration: `${IN_MS}ms`,
                animationDelay: `${OUT_MS}ms`,
              }
            : undefined
        }
      >
        {render(show)}
      </div>
    </div>
  );
}
