// A phone's on-screen keyboard, up while something is being typed into.
// A page change animated while it's going down is given up on by the
// browser (the screen changes size under it), so it's put away first.

const typing = () => {
  const el = document.activeElement;
  return (
    el instanceof HTMLElement &&
    (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) &&
    matchMedia('(pointer: coarse)').matches
  );
};

// Whether the keyboard is likely up now
export const keyboardUp = typing;

// Puts the keyboard away, resolving once the screen has stopped changing
// size (or soon, if it doesn't say)
export function putKeyboardAway(): Promise<void> {
  if (!typing()) return Promise.resolve();
  (document.activeElement as HTMLElement).blur();
  const viewport = window.visualViewport;
  return new Promise((resolve) => {
    let settle = window.setTimeout(done, 400);
    function done() {
      viewport?.removeEventListener('resize', onResize);
      resolve();
    }
    function onResize() {
      window.clearTimeout(settle);
      settle = window.setTimeout(done, 120);
    }
    viewport?.addEventListener('resize', onResize);
  });
}
