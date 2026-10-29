import type { CSSProperties } from 'react';
import { seedOf } from '@/shared/lib/seed';

// A book lying in a pile (ListPile, ListLamp): a little askew as a real
// pile is, and as the pile's pointed at (a `group`), easing a little to
// one side or the other from where it lay, turning the slightest bit,
// those higher up lifting a touch, from the bottom up
export const leanClass =
  'transition-[translate,rotate] duration-700 ease-soft [rotate:var(--r)] [translate:var(--x)_0] group-hover:[rotate:var(--hr)] group-hover:[translate:var(--hx)_var(--hy)]';

// Its lean, `up` books from the bottom of a pile of `of`: in a tall pile
// each lifts and waits less, so the whole loosens as quickly and as little
export function leanOf(id: string, up: number, of: number): CSSProperties {
  const seed = seedOf(id);
  // Which way it slides
  const side = seedOf(id + 'side') < 0.5 ? -1 : 1;
  // How it's turned, apart from how far it lies off the middle
  const turn = seedOf(id + 'turn');
  const share = Math.min(1, 16 / of);
  return {
    '--x': `${(seed * 16 - 8).toFixed(1)}px`,
    '--r': `${(turn * 6 - 3).toFixed(2)}deg`,
    '--hx': `${(seed * 16 - 8 + side * (1.5 + seed * 2.5)).toFixed(1)}px`,
    '--hy': `${(-up * 0.25 * share).toFixed(2)}px`,
    '--hr': `${(turn * 6 - 3 + side * (0.4 + seed * 0.8)).toFixed(2)}deg`,
    transitionDelay: `${Math.round(up * 10 * share)}ms`,
  } as CSSProperties;
}
