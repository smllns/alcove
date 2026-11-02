import { useEffect, useState, type SyntheticEvent } from 'react';
import { coverSeen, markCoverSeen } from './coverImage';

type Load = 'loading' | 'loaded' | 'failed';

// How long to wait before asking again for a picture that didn't come:
// Open Library's covers are kept on archive.org, which now and then
// doesn't answer, a moment later answering as ever
const AGAIN_MS = [1500, 4000, 10000];

const start = (src: string | undefined) => {
  const known = Boolean(src && coverSeen(src));
  const load: Load = !src ? 'failed' : known ? 'loaded' : 'loading';
  return { src, known, load, tries: 0, waiting: false };
};

// A cover's picture coming in. `known`: seen already on this visit, so
// it's drawn with the rest of the page rather than after it, with nothing
// to fade in. `load` says how it's going, a missing one failing too (Open
// Library answers a missing cover with a 1×1 pixel). One that doesn't
// come is asked for again a few times, a while apart, still coming in
// meanwhile; given up on only after that. `picture` goes on the <img>, and
// `attempt` is its key, a fresh one asking afresh. A new `src` starts
// afresh.
export function useCoverPicture(src: string | undefined) {
  const [now, setNow] = useState(() => start(src));
  if (now.src !== src) setNow(start(src));
  const done = (load: Load) => setNow((n) => ({ ...n, load }));

  useEffect(() => {
    if (!now.waiting) return;
    const again = window.setTimeout(
      () => setNow((n) => ({ ...n, tries: n.tries + 1, waiting: false })),
      AGAIN_MS[now.tries],
    );
    return () => window.clearTimeout(again);
  }, [now.waiting, now.tries]);

  const picture = {
    decoding: now.known ? ('sync' as const) : ('async' as const),
    onLoad: (e: SyntheticEvent<HTMLImageElement>) => {
      const found = e.currentTarget.naturalWidth > 1;
      if (found && src) markCoverSeen(src);
      done(found ? 'loaded' : 'failed');
    },
    onError: () =>
      setNow((n) =>
        n.tries < AGAIN_MS.length
          ? { ...n, waiting: true }
          : { ...n, load: 'failed' },
      ),
  };
  return { known: now.known, load: now.load, attempt: now.tries, picture };
}
