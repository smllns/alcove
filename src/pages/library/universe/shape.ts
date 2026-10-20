import { useState } from 'react';
import { readStored, store } from '@/shared/lib/storage';

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

function read(): SkyShape {
  const saved = readStored(KEY) as SkyShape | null;
  return saved && order.includes(saved) ? saved : 'rounded';
}

// The chosen shape, remembered in this browser, and a way to the next one
export function useSkyShape() {
  const [shape, setShape] = useState(read);
  const next = () => {
    const following = order[(order.indexOf(shape) + 1) % order.length];
    setShape(following);
    store(KEY, following);
  };
  return [shape, next] as const;
}
