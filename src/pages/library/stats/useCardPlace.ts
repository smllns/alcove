import { useEffect, useRef, useState, type RefObject } from 'react';

// How near the foot of the screen the card may come
const GUTTER = 16;
// How much of the top of the screen the header and tabs pinned there
// cover, for the card not to open up under them
const PINNED = 96;
// How tall its books may scroll in at most, and at least (about a book and
// a half), when there's no room for more
const LONGEST = 352;
const SHORTEST = 120;
// How far past the edge of fitting the card has to go before it moves
// across, so scrolling slowly by that edge doesn't toss it to and fro
const SLACK = 24;
// How long the card takes to fade once left, for its books to go back to
// the top only once it's out of sight
const GONE_MS = 600;
// How long it takes to go, moving across on screen, before it comes back
// on the other side
const SWAP_MS = 200;

type Place = { under: boolean; room: number };

// Where a group's card (HoverBooks) opens: over the group where there's room
// for it, under it where there's more; fitting neither way, its books scroll in
// less room, for it to fit the roomier one. Chosen each time the group's
// pointed at and, while it is, as the page scrolls. Out of sight, the card is
// simply put there; on screen, it fades away and comes back there (`moving`),
// never jumping across, and stays put while the pointer's in it. Left and gone,
// its books are back at the top.
export function useCardPlace(
  card: RefObject<HTMLElement | null>,
  scroller: RefObject<HTMLElement | null>,
) {
  const [place, setPlace] = useState<Place>({
    under: false,
    room: LONGEST,
  });
  const [moving, setMoving] = useState(false);
  const [pointed, setPointed] = useState(false);
  const group = useRef<HTMLElement | null>(null);
  const now = useRef(place);
  // Whether the card's on screen: pointed at, or still fading once left
  const shown = useRef(false);
  const swap = useRef(0);
  const gone = useRef(0);

  const measure = (at: HTMLElement): Place => {
    const box = card.current;
    const list = scroller.current;
    // As tall as it'd be with all the room it may have
    const books = Math.min(list?.scrollHeight ?? 0, LONGEST);
    const tall = (box?.offsetHeight ?? 0) - (list?.offsetHeight ?? 0) + books;
    const { top, bottom } = at.getBoundingClientRect();
    const above = top - PINNED;
    const below = innerHeight - bottom - GUTTER;
    const fits = above >= tall + (now.current.under ? SLACK : -SLACK);
    const short = tall - Math.max(above, below);
    return {
      under: !fits && below > above,
      room: short > 0 ? Math.max(books - short, SHORTEST) : LONGEST,
    };
  };
  const put = (next: Place) => {
    now.current = next;
    setPlace(next);
  };
  const choose = () => {
    const at = group.current;
    if (!at) return;
    const next = measure(at);
    if (!shown.current) return put(next);
    // Not while it's being read: it would go from under the pointer
    if (card.current?.matches(':hover')) return;
    if (next.under === now.current.under) return;
    window.clearTimeout(swap.current);
    setMoving(true);
    swap.current = window.setTimeout(() => {
      put(measure(at));
      setMoving(false);
    }, SWAP_MS);
  };

  // While it's pointed at, chosen afresh as the page scrolls, once a frame
  useEffect(() => {
    if (!pointed) return;
    let frame = 0;
    const scrolled = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(choose);
    };
    document.addEventListener('scroll', scrolled, true);
    return () => {
      document.removeEventListener('scroll', scrolled, true);
      cancelAnimationFrame(frame);
    };
  });
  useEffect(
    () => () => {
      window.clearTimeout(swap.current);
      window.clearTimeout(gone.current);
    },
    [],
  );

  return {
    ...place,
    moving,
    enter: (at: HTMLElement) => {
      group.current = at;
      window.clearTimeout(gone.current);
      choose();
      shown.current = true;
      setPointed(true);
    },
    leave: () => {
      setPointed(false);
      gone.current = window.setTimeout(() => {
        shown.current = false;
        scroller.current?.scrollTo({ top: 0 });
      }, GONE_MS);
    },
  };
}
