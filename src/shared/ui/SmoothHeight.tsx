import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

// How long growing or shrinking to fit takes
const MS = 450;
// Changes closer together than this are something inside moving on its
// own (a text folding open): followed as they come, not eased again on top
const STREAM_MS = 120;

// Grows and shrinks smoothly to whatever's inside, as it changes (one
// thing swapped for another, an entry added): never a jump. What moves
// smoothly by itself inside it, it simply follows. The height is set on
// the element directly, frame by frame, without redrawing what's inside.
// What's inside that sticks out past its edges is cut off, so it's for
// plain content, not for things with shadows reaching out.
export function SmoothHeight({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const box = outer.current;
    const el = inner.current;
    if (!box || !el) return;
    let last = 0;
    const measure = () => {
      const now = performance.now();
      box.style.transition =
        last && now - last > STREAM_MS
          ? `height ${MS}ms var(--ease-soft)`
          : 'none';
      box.style.height = `${el.offsetHeight}px`;
      last = now;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={outer} className={cn('overflow-hidden', className)}>
      <div ref={inner}>{children}</div>
    </div>
  );
}
