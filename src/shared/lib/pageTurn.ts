// Page turns under way, for what has to wait for one, move along with it
// or keep out of its way. settleEntrances watches them all.

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

// A page turn beginning, until it's done, moving once `ready`
export function pageTurning(done: Promise<unknown>, ready: Promise<unknown>) {
  begun = ready.catch(() => {});
  ended = done.catch(() => {});
  turning++;
  void done.catch(() => {}).finally(() => turning--);
}
