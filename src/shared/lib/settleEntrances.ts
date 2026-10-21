// A page that rises in over the old one (the 'forward' transition), or is
// uncovered as the old one lowers away ('return'), needs no entrance of
// its own: whatever it would fade or rise into place is simply
// there, including whatever turns up while it's still rising (once its
// data loads, say). More than tidier: as a transition ends, WebKit
// (Safari, every iPhone browser) draws a frame of any entrance still under
// way back at its start, a visible blink. Only what plays once is settled;
// the sky's endless drifting and twinkling go on. Called once, it watches
// every view transition, the router's included, and keeps one the browser
// gives up on from turning into an error.

// Plays once, on the page itself (not the transition's own sheet)
const isEntrance = (animation: Animation) =>
  (animation instanceof CSSAnimation || animation instanceof CSSTransition) &&
  animation.effect?.getComputedTiming().iterations !== Infinity &&
  !(animation.effect as KeyframeEffect | null)?.pseudoElement;

const settle = (animations: Animation[]) => {
  for (const animation of animations)
    if (isEntrance(animation)) animation.finish();
};

// Anything starting on the page while it rises
const settleStarted = (e: Event) => {
  if (e.target instanceof Element) settle(e.target.getAnimations());
};
const STARTS = ['animationstart', 'transitionrun'];

export function settleEntrances() {
  const start = document.startViewTransition?.bind(document);
  if (!start) return;
  document.startViewTransition = ((
    ...args: Parameters<typeof document.startViewTransition>
  ) => {
    const transition = start(...args);
    // A transition the browser gives up on (the screen changed size under
    // it, as a phone's toolbar or keyboard comes and goes) simply shows the
    // new page at once; nothing to report
    for (const step of [
      transition.ready,
      transition.updateCallbackDone,
      transition.finished,
    ])
      step.catch(() => {});
    const kind = document.documentElement.dataset.transition;
    if (kind !== 'forward' && kind !== 'return') return transition;
    transition.updateCallbackDone
      .then(() => {
        settle(document.getAnimations());
        for (const type of STARTS)
          document.addEventListener(type, settleStarted, true);
      })
      .catch(() => {});
    transition.finished
      .catch(() => {})
      .finally(() => {
        for (const type of STARTS)
          document.removeEventListener(type, settleStarted, true);
      });
    return transition;
  }) as typeof document.startViewTransition;
}
