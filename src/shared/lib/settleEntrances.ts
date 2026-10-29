// A page that rises in over the old one (the 'forward' transition, and 'onward'
// to a section of the library), is uncovered as the old one lowers away
// ('return'), or something shown in place of what was (a room or a home in the
// places: 'swap') needs no entrance of its own: whatever it would fade or rise
// into place is simply there, including whatever turns up while it's still
// rising (once its data loads, say). More than tidier: as a transition ends,
// WebKit (Safari, every iPhone browser) draws a frame of any entrance still
// under way back at its start, a visible blink. Only what plays once is
// settled; the sky's endless drifting is held still instead
// (stillWhileTurning). Called once, it watches every view transition, the
// router's included, keeps one the browser gives up on from turning into an
// error, and ends one that's stuck rather than leave it hanging over the page.

import { pageTurning } from './stillWhileTurning';

// Plays once, on the page itself (not the transition's own sheet), and
// isn't part of the change itself (data-moves-along: the library's tabs'
// shading, gliding over to the section chosen)
const isEntrance = (animation: Animation) => {
  const effect = animation.effect as KeyframeEffect | null;
  return (
    (animation instanceof CSSAnimation || animation instanceof CSSTransition) &&
    effect?.getComputedTiming().iterations !== Infinity &&
    !effect?.pseudoElement &&
    !effect?.target?.closest('[data-moves-along]')
  );
};

const settle = (animations: Animation[]) => {
  for (const animation of animations)
    if (isEntrance(animation)) animation.finish();
};

// Anything starting on the page while it rises
const settleStarted = (e: Event) => {
  if (e.target instanceof Element) settle(e.target.getAnimations());
};
const STARTS = ['animationstart', 'transitionrun'];

// Longer than any transition of ours takes (the longest, about a second
// and a half). One still going by then is stuck: Safari can leave one
// hanging half done (the app sent to the background mid-way, say), its
// picture of the page over the page itself, taking every tap, until a
// reload. Ended, the new page simply shows.
const STUCK_MS = 4000;
const live = new Set<{ skipTransition: () => void }>();
const endAll = () => {
  for (const transition of live) transition.skipTransition();
};

export function settleEntrances() {
  const start = document.startViewTransition?.bind(document);
  if (!start) return;
  // Gone to the background mid-way, it's ended at once
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) endAll();
  });
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
    pageTurning(transition.finished, transition.ready);
    live.add(transition);
    const stuck = window.setTimeout(
      () => transition.skipTransition(),
      STUCK_MS,
    );
    void transition.finished
      .catch(() => {})
      .finally(() => {
        live.delete(transition);
        window.clearTimeout(stuck);
      });
    const kind = document.documentElement.dataset.transition;
    if (!['forward', 'return', 'onward', 'swap'].includes(kind ?? ''))
      return transition;
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
