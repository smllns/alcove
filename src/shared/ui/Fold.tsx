import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { keepInPlace } from '@/shared/lib/keepInPlace';
import { QuietButton } from './ListControls';

// How long opening and closing take (index.css)
const FOLD_MS = 600;

// Long text shown by its first `lines`, opening to the rest and folding
// back smoothly (styles in index.css). Folding back, the page goes along
// with it, so the button stays under the reader's pointer. Text that's
// short enough is simply shown. `className` styles the text, which sets
// how tall a line is.
export function Fold({
  lines = 6,
  className,
  children,
}: {
  lines?: number;
  className?: string;
  children: ReactNode;
}) {
  const text = useRef<HTMLDivElement>(null);
  const [heights, setHeights] = useState<{ full: number; folded: number }>();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLDivElement>(null);

  // Measured again whenever the text reflows (a narrower window, say)
  useLayoutEffect(() => {
    const el = text.current;
    if (!el) return;
    const measure = () =>
      setHeights({
        full: el.scrollHeight,
        folded: Math.round(parseFloat(getComputedStyle(el).lineHeight) * lines),
      });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [lines]);

  const folds = heights !== undefined && heights.full > heights.folded + 4;

  return (
    <div>
      <div
        data-folded={(folds && !open) || undefined}
        className='fold overflow-hidden'
        style={
          folds
            ? { maxHeight: open ? heights.full : heights.folded }
            : undefined
        }
      >
        <div ref={text} className={className}>
          {children}
        </div>
      </div>
      {folds && (
        <div ref={toggle} className='mt-2'>
          <QuietButton
            onClick={() => {
              if (open) keepInPlace(toggle.current, FOLD_MS);
              setOpen(!open);
            }}
          >
            {open ? 'Less' : 'Read more'}
          </QuietButton>
        </div>
      )}
    </div>
  );
}
