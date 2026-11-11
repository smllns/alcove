import {
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';

// How near the foot of the screen the card may come
const GUTTER = 16;
// How much of the top of the screen the header and tabs pinned there
// cover, for the card not to open up under them
const PINNED = 96;
// How tall its books may scroll in at most, and at least (about a book and
// a half), when there's no room for more
const LONGEST = 352;
const SHORTEST = 120;
// The card's width (HoverBooks), and how much of it stays over the group
// on either side of the group's middle, however far it's moved across
const WIDTH = 320;
const OVER = 40;
// How long the card takes to fade once left, for its books to go back to
// the top only once it's out of sight
export const GONE_MS = 600;

// Where the card is from the group: `top`, how far down from the group's
// top its own is; `shift`, how far across its middle is from the group's;
// `under`, whether it's more below the group than above; `room`, how tall
// its books may scroll in
type Place = { top: number; shift: number; under: boolean; room: number };

// Where a group's card (HoverBooks) opens, for it to be easy to read: in
// the middle of the screen, as near as it'll go, covering the group itself
// if need be, but always touching it, so the pointer can go into it, and
// all on the screen, its books scrolling in less room if they must. Chosen
// as the group's pointed at; it then scrolls with the page, staying put.
// Left and gone (HoverBooks unmakes it GONE_MS later), its books are
// back at the top as it's made afresh.
export function useCardPlace(
  card: RefObject<HTMLElement | null>,
  scroller: RefObject<HTMLElement | null>,
) {
  const [place, setPlace] = useState<Place>({
    top: 0,
    shift: 0,
    under: false,
    room: LONGEST,
  });
  const [pointed, setPointed] = useState(false);
  const group = useRef<HTMLElement | null>(null);

  const measure = (at: HTMLElement): Place => {
    const box = card.current;
    const list = scroller.current;
    // All but its books, and its books as tall as they'd be with all the
    // room they may have, or as the screen leaves them
    const rest = (box?.offsetHeight ?? 0) - (list?.offsetHeight ?? 0);
    const space = innerHeight - PINNED - GUTTER;
    const books = Math.min(list?.scrollHeight ?? 0, LONGEST);
    const room = Math.max(SHORTEST, Math.min(books, space - rest));
    const tall = rest + room;
    const { top, bottom, left, right } = at.getBoundingClientRect();
    // Down: in the middle, then touching the group, then on the screen
    const middle = PINNED + (space - tall) / 2;
    const touching = Math.min(Math.max(middle, top - tall), bottom);
    const y = Math.min(Math.max(touching, PINNED), innerHeight - GUTTER - tall);
    // Across: towards the middle, as far as it'll go over the group; and
    // wholly on the screen, whatever that takes
    const reach = WIDTH / 2 - OVER;
    const centre = (left + right) / 2;
    const towards = Math.max(-reach, Math.min(reach, innerWidth / 2 - centre));
    const edge = GUTTER + WIDTH / 2;
    const shift = Math.max(
      edge - centre,
      Math.min(innerWidth - edge - centre, towards),
    );
    return {
      top: Math.round(y - top),
      shift: Math.round(shift),
      under: y + tall / 2 > (top + bottom) / 2,
      room: room < books ? room : LONGEST,
    };
  };

  // Pointed at: chosen once the card's there to measure (it's made only
  // then, HoverBooks), before it's drawn
  const placeMade = useEffectEvent(() => {
    if (group.current) setPlace(measure(group.current));
  });
  useLayoutEffect(() => {
    if (pointed) placeMade();
  }, [pointed]);

  return {
    ...place,
    pointed,
    enter: (at: HTMLElement) => {
      group.current = at;
      setPointed(true);
    },
    leave: () => setPointed(false),
  };
}
