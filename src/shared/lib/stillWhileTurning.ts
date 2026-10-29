// Endless animations on a page (the sky's drifting books) held still while
// the page turns, and let go again once it's turned: WebKit draws the
// turning page from what it showed as the turn began, so anything that
// had moved on meanwhile jumped to where it had got to as the turn ended.
// One started while the page turns (on the page turning in) waits for it
// too, from where it was to begin.

const kept = new Set<Animation>();
// Page turns under way (one may begin before the last is done)
let turning = 0;
// Once the last page turn began to move (settled as soon as it's done
// with, or with none ever begun)
let begun: Promise<unknown> = Promise.resolve();

// Once the last page turn is done (settled at once with none under way)
let ended: Promise<unknown> = Promise.resolve();

// For something to move along with the page turning, from when it begins
// to move rather than as soon as the page under it has changed
export const turnBegun = () => begun;
// For something to wait for the page to have turned (usePageTurned)
export const turnEnded = () => ended;
// Whether a page is turning right now
export const isTurning = () => turning > 0;

// Keeps `animation` still whenever a page turns; the returned function
// lets it go for good (as it's cancelled)
export function stillWhileTurning(animation: Animation) {
  kept.add(animation);
  if (turning) animation.pause();
  return () => void kept.delete(animation);
}

// A page turn beginning, until it's done (settleEntrances watches them
// all), moving once `ready`
export function pageTurning(done: Promise<unknown>, ready: Promise<unknown>) {
  begun = ready.catch(() => {});
  ended = done.catch(() => {});
  turning++;
  for (const animation of kept) animation.pause();
  void done
    .catch(() => {})
    .finally(() => {
      if (--turning) return;
      for (const animation of kept) animation.play();
    });
}
