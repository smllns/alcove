import {
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/shared/lib/cn';
import { raisedClass, solidRaisedClass } from './surfaces';

const GAP = 6;
const EDGE = 8;

type PopoverProps = {
  open: boolean;
  // What it opens from; it sits just below (or above, if there's no room)
  anchor: RefObject<HTMLElement | null>;
  // Escape hands the focus back to the field; a click elsewhere leaves it
  // where it went
  onClose: (how: 'escape' | 'outside') => void;
  // At least as wide as the anchor, unless a width is given
  width?: number;
  // Set in the page right under its anchor (inside the same `relative`
  // box), moving with it as the page does, rather than drawn over the
  // page and following it: for an anchor nothing round it clips
  inline?: boolean;
  className?: string;
  children: ReactNode;
};

// A panel floating by the field that opened it: a menu, a calendar. Drawn
// over the whole page (so a collapsing section can't clip it), it follows
// the field as the page scrolls, or, `inline`, sits in the page under it;
// either way it closes on Escape or a click elsewhere.
export function Popover({
  open,
  anchor,
  onClose,
  width,
  inline = false,
  className,
  children,
}: PopoverProps) {
  const panel = useRef<HTMLDivElement>(null);

  // Placed straight onto the element, so scrolling never has to re-render
  useLayoutEffect(() => {
    const el = panel.current;
    if (!open || !el) return;
    if (inline) {
      // Only kept on the screen from side to side: the page carries it up
      // and down with its anchor
      const fit = () => {
        // Measured from the box it's set in, not as it pops in, scaled
        const left = (el.offsetParent ?? el).getBoundingClientRect().left;
        const over = left + el.offsetWidth - (innerWidth - EDGE);
        el.style.left = `${over > 0 ? -Math.min(over, Math.max(left - EDGE, 0)) : 0}px`;
      };
      fit();
      addEventListener('resize', fit);
      return () => removeEventListener('resize', fit);
    }
    const place = () => {
      const box = anchor.current?.getBoundingClientRect();
      if (!box) return;
      const w = width ?? box.width;
      const below = innerHeight - box.bottom - GAP - EDGE;
      const above = box.top - GAP - EDGE;
      const height = el.scrollHeight;
      const flip = height > below && above > below;
      el.style.width = `${Math.min(w, innerWidth - EDGE * 2)}px`;
      el.style.maxHeight = `${Math.max(flip ? above : below, 160)}px`;
      el.style.left = `${Math.min(Math.max(box.left, EDGE), innerWidth - EDGE - Math.min(w, innerWidth - EDGE * 2))}px`;
      el.style.top = flip
        ? `${box.top - GAP - Math.min(height, above)}px`
        : `${box.bottom + GAP}px`;
    };
    place();
    addEventListener('scroll', place, true);
    addEventListener('resize', place);
    // Again as what's in it grows or shrinks (a list narrowed down), so one
    // opened above stays against its field
    const sized = new ResizeObserver(place);
    sized.observe(el);
    return () => {
      removeEventListener('scroll', place, true);
      removeEventListener('resize', place);
      sized.disconnect();
    };
  }, [open, anchor, width, inline]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (anchor.current?.contains(target) || panel.current?.contains(target))
        return;
      onClose('outside');
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open, anchor, onClose]);

  if (!open) return null;
  const drawn = (
    <div
      ref={panel}
      onKeyDown={(e) => {
        if (e.key !== 'Escape') return;
        e.stopPropagation();
        onClose('escape');
      }}
      style={inline ? { width } : undefined}
      className={cn(
        'z-50 flex animate-pop flex-col overflow-hidden rounded-2xl text-ink',
        inline
          ? 'absolute left-0 top-full mt-1.5 max-w-[calc(100vw-1rem)]'
          : 'fixed',
        // In the page, nothing's blurred behind it there: solid instead
        inline ? solidRaisedClass : raisedClass,
        className,
      )}
    >
      {children}
    </div>
  );
  return inline ? drawn : createPortal(drawn, document.body);
}
