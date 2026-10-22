import { useState, type SyntheticEvent } from 'react';
import { coverSeen, markCoverSeen } from './coverImage';

type Load = 'loading' | 'loaded' | 'failed';

const start = (src: string | undefined) => {
  const known = Boolean(src && coverSeen(src));
  const load: Load = !src ? 'failed' : known ? 'loaded' : 'loading';
  return { src, known, load };
};

// A cover's picture coming in. `known`: seen already on this visit, so
// it's drawn with the rest of the page rather than after it, with nothing
// to fade in. `load` says how it's going, a missing one failing too (Open
// Library answers a missing cover with a 1×1 pixel). `picture` goes on the
// <img>. A new `src` starts afresh.
export function useCoverPicture(src: string | undefined) {
  const [now, setNow] = useState(() => start(src));
  if (now.src !== src) setNow(start(src));
  const done = (load: Load) => setNow((n) => ({ ...n, load }));

  const picture = {
    decoding: now.known ? ('sync' as const) : ('async' as const),
    onLoad: (e: SyntheticEvent<HTMLImageElement>) => {
      const found = e.currentTarget.naturalWidth > 1;
      if (found && src) markCoverSeen(src);
      done(found ? 'loaded' : 'failed');
    },
    onError: () => done('failed'),
  };
  return { known: now.known, load: now.load, picture };
}
