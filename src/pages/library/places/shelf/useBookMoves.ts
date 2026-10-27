import { useLayoutEffect, useRef, type RefObject } from 'react';
import { gsap } from '@/shared/lib/gsap';

// How far apart books moved together go, and come in, one after another,
// and the most such steps however many there are
const STEP = 0.045;
const STEPS = 8;
const inTurn = (books: unknown[]) => ({
  amount: Math.min(books.length - 1, STEPS) * STEP,
});

// Books in a room (li[data-book]) moved elsewhere, with GSAP: those here
// fade where they stand, one after another; then, as they're put where
// they're going (`apply`, the room changing with `books`), the books
// round them glide over to where they now stand (noted where they stood
// all at once, and found where they stand all at once, so the page is laid
// out only the once), and those that came in somewhere in this room fade
// in there, one after another again.
export function useBookMoves(
  room: RefObject<HTMLElement | null>,
  books: unknown,
) {
  // Where the books beside those moving stood, how tall each shelf's
  // sheet was, and which books are moving
  const pending = useRef<{
    stood: Map<string, { left: number; top: number }>;
    sheets: Map<HTMLElement, number>;
    ids: Set<string>;
  } | null>(null);
  const each = (pick: (id: string) => boolean) =>
    Array.from(
      room.current?.querySelectorAll<HTMLElement>('li[data-book]') ?? [],
    ).filter((book) => pick(book.dataset.book!));

  // As soon as the room's laid out afresh, before it's shown
  useLayoutEffect(() => {
    const was = pending.current;
    if (!was) return;
    pending.current = null;
    // Each shelf's sheet held at the height it was a moment longer: the
    // books beside those gone glide over within their sheets (measured
    // against the sheets as they were, not again as the sheets above them
    // shrink), and the sheets then grow or shrink to their row
    // more or fewer, all under them moving with them, rather than jumping
    const resized = [...was.sheets]
      .filter(([sheet]) => sheet.isConnected)
      .map(([sheet, height]) => [sheet, height, sheet.offsetHeight] as const)
      .filter(([, height, now]) => height !== now);
    for (const [sheet, height] of resized)
      gsap.set(sheet, { height, overflow: 'clip' });
    // Where each now stands, all read before any is moved
    const glides = each((id) => was.stood.has(id)).flatMap((book) => {
      const from = was.stood.get(book.dataset.book!)!;
      const now = book.getBoundingClientRect();
      const [x, y] = [from.left - now.left, from.top - now.top];
      return x || y ? [{ book, x, y }] : [];
    });
    for (const { book, x, y } of glides)
      gsap.fromTo(
        book,
        { x, y },
        {
          x: 0,
          y: 0,
          duration: 0.4,
          ease: 'power2.inOut',
          clearProps: 'transform',
        },
      );
    for (const [sheet, , now] of resized)
      gsap.to(sheet, {
        height: now,
        duration: 0.45,
        // Gently from the start: the first moment after a change is the
        // slowest to draw, on a phone most of all
        ease: 'power2.inOut',
        clearProps: 'height,overflow',
      });
    const come = each((id) => was.ids.has(id));
    if (come.length)
      gsap.fromTo(
        come,
        { opacity: 0, scale: 0.9, y: 6 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.45,
          delay: 0.1,
          ease: 'power2.out',
          stagger: inTurn(come),
          clearProps: 'opacity,scale,transform',
        },
      );
    // Only once the books have changed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [books]);

  return {
    move: (ids: string[], apply: () => void) => {
      const moving = new Set(ids);
      const then = () => {
        // Every other book in the room glides to where it then stands:
        // those beside the ones gone, and those on the shelf they come
        // to, its last row centred afresh on a phone (the sheets held as
        // they were meanwhile, so no book counts a sheet's change twice)
        pending.current = {
          stood: new Map(
            each((id) => !moving.has(id)).map((book) => {
              const { left, top } = book.getBoundingClientRect();
              return [book.dataset.book!, { left, top }];
            }),
          ),
          sheets: new Map(
            Array.from(
              room.current?.querySelectorAll<HTMLElement>('[data-sheet]') ?? [],
            ).map((sheet) => [sheet, sheet.offsetHeight]),
          ),
          ids: moving,
        };
        apply();
      };
      const going = each((id) => moving.has(id));
      if (!going.length) return then();
      gsap.to(going, {
        opacity: 0,
        scale: 0.85,
        duration: 0.22,
        ease: 'power2.in',
        stagger: inTurn(going),
        onComplete: then,
      });
    },
  };
}
