import { HttpError } from '../lib/errors.js';

// Spaces out calls to stay within `perSecond`: each caller waits for its
// turn. A queue longer than `maxWaitMs` means someone is typing faster than
// the catalogue can answer; rather than pile up, the request is turned away.
export function throttle(perSecond: number, maxWaitMs = 4000) {
  const gap = Math.ceil(1000 / perSecond);
  let nextSlot = 0;

  return async function nextTurn() {
    const now = Date.now();
    const at = Math.max(now, nextSlot);
    if (at - now > maxWaitMs) {
      throw new HttpError(
        429,
        'catalogue_busy',
        'Searching a little too fast. Give it a second.',
      );
    }
    nextSlot = at + gap;
    if (at > now) await new Promise((resolve) => setTimeout(resolve, at - now));
  };
}
