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
// What's inside that sticks out past its edges (a shadow, a card shown
// over the page on hover) is cut off only while it eases.
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
      const height = `${el.offsetHeight}px`;
      const easing = last > 0 && now - last > STREAM_MS;
      box.style.transition = easing
        ? `height ${MS}ms var(--ease-soft)`
        : 'none';
      if (easing && box.style.height !== height) box.style.overflow = 'hidden';
      else if (!easing) box.style.overflow = '';
      box.style.height = height;
      last = now;
    };
    const eased = (event: TransitionEvent) => {
      if (event.target === box) box.style.overflow = '';
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    box.addEventListener('transitionend', eased);
    return () => {
      observer.disconnect();
      box.removeEventListener('transitionend', eased);
    };
  }, []);

  return (
    // Its own box, so margins inside stay inside, clipped or not
    <div ref={outer} className={cn('flow-root', className)}>
      <div ref={inner}>{children}</div>
    </div>
  );
}
