import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { showcaseBooks } from '@/entities/book/showcase';
import { prefersReducedMotion } from '@/shared/lib/motion';
import type { AuthMode } from './authCopy';
import './coverFan.css';

type Slot = 'left' | 'right' | 'top';

// Where each slot sits, as offsets of a card centred in the fan
const slots: Record<Slot, gsap.TweenVars> = {
  left: { xPercent: -88, yPercent: -54, rotation: -11 },
  right: { xPercent: -12, yPercent: -48, rotation: 9 },
  top: { xPercent: -50, yPercent: -52, rotation: -1.5 },
};

const titles = ['Fruit Fly', 'Exciting Times', 'Big Swiss'] as const;
type Title = (typeof titles)[number];

// Which book lies where. Each switch swaps the left and top cards; the right
// one stays put.
const arrangements: Record<AuthMode, Record<Title, Slot>> = {
  login: { 'Fruit Fly': 'left', 'Exciting Times': 'right', 'Big Swiss': 'top' },
  register: {
    'Big Swiss': 'left',
    'Exciting Times': 'right',
    'Fruit Fly': 'top',
  },
};

// Stacking never changes while cards overlap: top over left over right
const depth: Record<Slot, number> = { top: 3, left: 2, right: 1 };

// Just far enough left to slip out from under the top card, so it can change
// layer unseen. Slightly larger, as if picked up.
const pulledOut: gsap.TweenVars = {
  xPercent: -170,
  yPercent: -58,
  rotation: -6,
  scale: 1.04,
};

const covers = titles.map((title) =>
  showcaseBooks.find((book) => book.title === title)!,
);

// Three covers fanned out like books left on a table. Changing `mode` deals
// them again, always through the left: the left card is picked up and slid
// out from under the top one, then laid on top as the old top card settles
// into its place.
export function CoverFan({ mode }: { mode: AuthMode }) {
  const cards = useRef<Record<Title, HTMLDivElement | null>>({
    'Fruit Fly': null,
    'Exciting Times': null,
    'Big Swiss': null,
  });
  const previous = useRef<AuthMode | null>(null);

  useLayoutEffect(() => {
    const from = previous.current;
    previous.current = mode;
    const layout = arrangements[mode];
    // A card's wrapper and cover image, or null before they've mounted
    const parts = (title: Title) => {
      const card = cards.current[title];
      const image = card?.firstElementChild;
      return card && image ? { card, image } : null;
    };

    const ctx = gsap.context(() => {
      for (const title of titles) {
        const card = parts(title)?.card;
        if (card) card.dataset.slot = layout[title];
      }

      // First paint, or no motion wanted: just put everything in place
      if (!from || from === mode || prefersReducedMotion) {
        for (const title of titles) {
          const part = parts(title);
          if (!part) continue;
          gsap.set(part.card, { zIndex: depth[layout[title]] });
          gsap.set(part.image, slots[layout[title]]);
        }
        return;
      }

      const incoming = parts(titles.find((t) => layout[t] === 'top')!);
      const outgoing = parts(titles.find((t) => layout[t] === 'left')!);
      if (!incoming || !outgoing) return;

      gsap
        .timeline({ defaults: { ease: 'sine.inOut' } })
        // Picked up and drawn out to the left along a gentle arc
        .to(
          incoming.image,
          { ...pulledOut, duration: 0.55, ease: 'power2.out' },
          0,
        )
        // Held above the table: a bigger, softer shadow (see coverFan.css)
        .set(incoming.image, { attr: { 'data-lifted': '' } }, 0)
        // Clear of the top card now: swap layers
        .set(incoming.card, { zIndex: depth.top }, 0.55)
        .set(outgoing.card, { zIndex: depth.left }, 0.55)
        // Laid down on top as the old top card eases into its place
        .to(incoming.image, { ...slots.top, scale: 1, duration: 0.8 }, 0.55)
        // The shadow settles back through a CSS transition
        .call(() => incoming.image.removeAttribute('data-lifted'), [], 0.75)
        .to(outgoing.image, { ...slots.left, duration: 0.8 }, 0.6);
    });

    return () => ctx.kill();
  }, [mode]);

  return (
    <div className='cover-fan relative aspect-4/5 w-full max-w-105'>
      {covers.map((book) => (
        <div
          key={book.title}
          ref={(el) => {
            cards.current[book.title as Title] = el;
          }}
          className='cover-fan-card absolute inset-0'
        >
          <img
            src={book.cover}
            alt=''
            draggable={false}
            className='cover-fan-image absolute top-1/2 left-1/2 w-[52%] rounded-[3px]'
          />
        </div>
      ))}
    </div>
  );
}
