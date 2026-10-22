import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { cn } from '@/shared/lib/cn';
import { cubicBezier } from '@/shared/lib/easing';
import { foldMotion } from '@/shared/lib/foldMotion';
import { foldPoint } from '@/shared/lib/foldPoint';
import { Folding } from './folding';
import { MoreToggle } from './MoreToggle';

// How long opening and closing take
const FOLD_MS = 600;
// Even from start to end: a long text eased out would leap open at once
const foldEase = cubicBezier(0.45, 0, 0.2, 1);

// A click on the text itself, not on something in it (a link, a button)
// nor the end of selecting some of it
const plainTextClick = (e: MouseEvent) =>
  !(e.target as Element).closest('a, button, input, textarea') &&
  !getSelection()?.toString();

// Long text shown by about its first `lines` (cut mid-paragraph, so it
// plainly goes on: foldPoint), opening to the rest and folding back
// smoothly, by its button or a click anywhere on it, which lights the
// button up as it's hovered (the fade on its last lines is in index.css).
// The page holds still as it does, unless it would fold away out of sight
// above (shared/lib/foldMotion). Text that's short enough is simply
// shown. `className` styles the text, which sets how tall a line is.
export function Fold({
  lines = 6,
  className,
  children,
}: {
  lines?: number;
  className?: string;
  children: ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLDivElement>(null);
  const [heights, setHeights] = useState<{ full: number; folded: number }>();
  const [open, setOpen] = useState(false);
  // Stops the opening or closing under way
  const moving = useRef<() => void>(undefined);
  useEffect(() => () => moving.current?.(), []);

  // Measured again whenever the text reflows (a narrower window, say)
  useLayoutEffect(() => {
    const el = text.current;
    if (!el) return;
    const measure = () =>
      setHeights({
        full: el.scrollHeight,
        folded: foldPoint(el, lines),
      });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [lines]);

  const folds = heights !== undefined && heights.full > heights.folded + 4;

  // How tall it's meant to be: so it is when still, and once still again
  // after moving (measured anew meanwhile, say, as the window narrowed)
  const resting = useRef('');
  useLayoutEffect(() => {
    resting.current =
      folds && heights ? `${open ? heights.full : heights.folded}px` : '';
    if (box.current && !moving.current)
      box.current.style.maxHeight = resting.current;
  }, [folds, open, heights]);

  const toggle = () => {
    const el = box.current;
    if (!el || !heights) return;
    moving.current?.();
    const from = el.offsetHeight;
    const to = open ? heights.folded : heights.full;
    setOpen(!open);
    moving.current = foldMotion({
      at: el,
      closing: open,
      ms: FOLD_MS,
      ease: foldEase,
      frame: (p) => (el.style.maxHeight = `${from + (to - from) * p}px`),
      done: () => {
        moving.current = undefined;
        el.style.maxHeight = resting.current;
      },
    });
  };

  return (
    <div className='group/fold'>
      <div
        ref={box}
        data-folded={(folds && !open) || undefined}
        onClick={folds ? (e) => plainTextClick(e) && toggle() : undefined}
        className={cn('fold overflow-hidden', folds && 'cursor-pointer')}
      >
        <div ref={text} className={className}>
          <Folding value={folds}>{children}</Folding>
        </div>
      </div>
      {folds && (
        <MoreToggle
          open={open}
          onClick={toggle}
          className='mt-2 group-hover/fold:text-ink'
        >
          {open ? 'Show less' : 'Read more'}
        </MoreToggle>
      )}
    </div>
  );
}
