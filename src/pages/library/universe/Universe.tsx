import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from 'react';
import type { Book } from '@/entities/book/types';
import { boundsOf, layoutSky } from './layout';
import { letGo } from './leaving';
import { SkyControls } from './SkyControls';
import { SkyDust } from './SkyDust';
import { SkyLinks } from './SkyLinks';
import { useSkyShape } from './shape';
import { SkyStar } from './SkyStar';
import { SkyVeil } from './SkyVeil';
import { useSkyCamera } from './useSkyCamera';
import { leaveForBook } from '../views/leaveForBook';
import { useTransitionNavigate } from '@/shared/lib/useTransitionNavigate';
import { cn } from '@/shared/lib/cn';
import { floatingClass } from '@/shared/ui/surfaces';
import { paths } from '@/shared/config/paths';

// Every book a star, scattered across a sky to drag around and zoom into.
// The best loved shine the biggest; a writer's books are gathered into a
// constellation, which lights up as one of them is pointed at. While searching, the books in `lit`
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
  // The writer of the book under the mouse, whose constellation lights up
  const [kin, setKin] = useState<string | null>(null);
  const writerOf = useMemo(
    () => new Map(layout.stars.map((star) => [star.book.id, star.group])),
    [layout],
  );
  // The book under the mouse, whose caption is kept the same size on
  // screen however far the sky is zoomed (stars.css). The sky is told
  // whether one is (data-pointing), for the rest of it to dim: told only
  // as the mouse comes onto a book or leaves the books, not at each one
  // it passes, as asking the sky whether any book is hovered would have
  // it look again at every book as each was
  const pointed = useRef<HTMLElement | null>(null);
  const pointAt = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const star = (e.target as Element)
      .closest<HTMLElement>('.star-body')
      ?.closest<HTMLElement>('[data-star]');
    if (pointed.current && pointed.current !== star) letGo(pointed.current);
    pointed.current = star ?? null;
    sky.current?.toggleAttribute('data-pointing', Boolean(star));
    star?.style.setProperty('--zoom', String(camera.zoom));
    const id = star?.dataset.star;
    setKin((id && writerOf.get(id)) || null);
  };
  const navigate = useTransitionNavigate();
  // A book tapped (not dragged past) opens
  const open = (target: Element) => {
    const star = target
      .closest<HTMLElement>('.star-body')
      ?.closest<HTMLElement>('[data-star]');
    const id = star?.dataset.star;
    if (!id) return;
    leaveForBook(id, star);
    navigate(paths.book(id));
  };
  const { camera, placed, dragging, fit, zoomIn, zoomOut, handlers } =
    useSkyCamera(
      sky,
      layout,
      litStars.length ? boundsOf(litStars) : null,
      insetTop,
      open,
    );

  // Only that book is told the zoom, as it changes: told to the whole sky,
  // every book in it was restyled at every step of a zoom
  useLayoutEffect(() => {
    pointed.current?.style.setProperty('--zoom', String(camera.zoom));
  }, [camera.zoom]);

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
      {...handlers}
      onPointerOver={pointAt}
      onPointerLeave={(e) => {
        handlers.onPointerLeave(e);
        if (pointed.current) letGo(pointed.current);
        pointed.current = null;
        setKin(null);
        sky.current?.removeAttribute('data-pointing');
      }}
    >
      <SkyDust x={camera.x} y={camera.y} />
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
        <SkyLinks links={layout.links} kin={kin} />
        <SkyVeil bounds={layout.bounds} />
        {layout.stars.map((star) => (
          <SkyStar
            key={star.book.id}
            star={star}
            lit={lit?.has(star.book.id) ?? false}
            kin={Boolean(kin) && star.group === kin}
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
