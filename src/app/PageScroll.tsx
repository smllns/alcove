import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { useLocation, useMatches, useNavigationType } from 'react-router';

// Where each page in the history was left scrolled to, by its entry
const positions = new Map<string, number>();

// The page each address belongs to: its own route, unless the route says
// it's one page with others (the library's sections, signing in and up)
function usePage() {
  const matches = useMatches();
  const { pathname } = useLocation();
  const shared = matches.findLast(
    (m) => (m.handle as { page?: string } | undefined)?.page,
  );
  return (shared?.handle as { page: string } | undefined)?.page ?? pathname;
}

// Each page scrolls in a box of its own, a screen tall, rather than the
// window: so turning from one page to another never scrolls the window
// (Safari draws the old page out of place for a frame if it does, and on
// an iPhone can't move the window and redraw the page in one frame, which
// flashes). A new page is a new box, starting at its top; going back, the
// page returned to is put back where it was left before it's first drawn.
// Staying on a page (a search, another section) keeps its box and scroll.
export function PageScroll({ children }: { children: ReactNode }) {
  const page = usePage();
  return (
    <div
      key={page}
      data-page-scroll
      className='h-dvh overflow-x-hidden overflow-y-auto'
    >
      <KeepScroll />
      {children}
    </div>
  );
}

// Ahead of the page in its box, so the page's first look at itself finds
// it already where it'll be: notes where the page is scrolled to as it
// scrolls, and going back to it, puts it back there
function KeepScroll() {
  const { key } = useLocation();
  const back = useNavigationType() === 'POP';
  const mark = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const box = mark.current?.parentElement;
    if (!box) return;
    const left = positions.get(key);
    if (back && left !== undefined) box.scrollTop = left;
    const note = () => positions.set(key, box.scrollTop);
    box.addEventListener('scroll', note, { passive: true });
    return () => box.removeEventListener('scroll', note);
  }, [key, back]);
  return <span ref={mark} hidden />;
}
