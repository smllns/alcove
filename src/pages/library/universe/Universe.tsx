import { useMemo, useRef, type CSSProperties, type ReactNode } from 'react';
import type { Book } from '@/entities/book/types';
import { boundsOf, layoutSky } from './layout';
import { SkyControls } from './SkyControls';
import { useSkyShape } from './shape';
import { SkyStar } from './SkyStar';
import { useSkyCamera } from './useSkyCamera';
import { cn } from '@/shared/lib/cn';
import { floatingClass } from '@/shared/ui/surfaces';

// How much slower the dust moves than the books, for a sense of depth
const DUST_DEPTH = 0.35;

// Every book a star, scattered across a sky to drag around and zoom into.
// The best loved shine the biggest. While searching, the books in `lit`
// shine and the rest fade, and the view glides over to them.
export function Universe({
  books,
  lit = null,
  eased = false,
  notice,
  insetTop = 0,
}: {
  books: Book[];
  lit?: Set<string> | null;
  // The sky came in by a transition, already faded in, so it needn't fade
  // in again on its own
  eased?: boolean;
  // Shown over the sky, e.g. that a search found nothing
  notice?: ReactNode;
  // How far down the tabs and the search reach over the sky; the books
  // are fitted into the room below
  insetTop?: number;
}) {
  const sky = useRef<HTMLDivElement>(null);
  const layout = useMemo(() => layoutSky(books), [books]);
  const [shape, nextShape] = useSkyShape();
  const litStars = useMemo(
    () => (lit ? layout.stars.filter((star) => lit.has(star.book.id)) : []),
    [layout, lit],
  );
  const { camera, placed, dragging, fit, zoomIn, zoomOut, handlers } =
    useSkyCamera(
      sky,
      layout,
      litStars.length ? boundsOf(litStars) : null,
      insetTop,
    );

  return (
    <div
      ref={sky}
      tabIndex={0}
      role='application'
      aria-label='Your books, scattered like stars. Drag to look around, use + and − to zoom.'
      data-dragging={dragging || undefined}
      data-shape={shape}
      data-searching={lit ? true : undefined}
      className='sky relative flex-1 cursor-grab touch-none select-none overflow-hidden outline-none data-dragging:cursor-grabbing'
      style={
        {
          '--dust-x': `${camera.x * DUST_DEPTH}px`,
          '--dust-y': `${camera.y * DUST_DEPTH}px`,
          '--zoom': camera.zoom,
        } as CSSProperties
      }
      {...handlers}
    >
      <div
        className={cn(
          'absolute left-0 top-0 z-1 origin-top-left will-change-transform',
          // Fades in once it's in place, rather than appearing in a blink;
          // unless the switch to it faded it in already
          !eased && 'transition-opacity duration-700 ease-soft',
          placed || eased ? 'opacity-100' : 'opacity-0',
        )}
        style={{
          transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})`,
        }}
      >
        {layout.stars.map((star) => (
          <SkyStar
            key={star.book.id}
            star={star}
            lit={lit?.has(star.book.id) ?? false}
          />
        ))}
      </div>
      {notice && (
        <div
          className='pointer-events-none absolute inset-x-0 z-2 flex justify-center px-6'
          style={{ top: insetTop + 24 }}
        >
          <div
            className={cn(
              'animate-rise rounded-full px-5 py-2.5 text-sm text-ink-soft',
              floatingClass,
            )}
          >
            {notice}
          </div>
        </div>
      )}
      <SkyControls
        shape={shape}
        onShape={nextShape}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onFit={fit}
      />
    </div>
  );
}
