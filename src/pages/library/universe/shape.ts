import { useState } from 'react';
import { useBriefly } from '@/shared/lib/useBriefly';
import { readOwn, storeOwn } from '@/shared/lib/storage';

// How the books look while they're stars: cut to a circle, the cover with
// its corners well rounded, or the cover as it is. Hovering always shows
// the whole cover.
export type SkyShape = 'circle' | 'rounded' | 'cover';

export const shapeNames: Record<SkyShape, string> = {
  circle: 'Circles',
  rounded: 'Rounded',
  cover: 'Covers',
};

const order: SkyShape[] = ['rounded', 'circle', 'cover'];
const KEY = 'alcove.sky-shape';
// How long the stars take to change shape (the clip-path, stars.css)
const RESHAPING_MS = 900;

function read(): SkyShape {
  const saved = readOwn(KEY) as SkyShape | null;
  return saved && order.includes(saved) ? saved : 'rounded';
}

// The chosen shape, remembered in this browser, a way to the next one, and
// whether the stars are still changing into it
export function useSkyShape() {
  const [shape, setShape] = useState(read);
  // The shape being changed into, for as long as that takes
  const [reshaping, setReshaping] = useBriefly<SkyShape>(RESHAPING_MS);
  const next = () => {
    const following = order[(order.indexOf(shape) + 1) % order.length];
    setShape(following);
    setReshaping(following);
    storeOwn(KEY, following);
  };
  return [shape, next, reshaping !== null] as const;
}
