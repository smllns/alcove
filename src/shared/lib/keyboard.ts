import { COARSE } from './useMediaQuery';

// A phone's on-screen keyboard, up while something is being typed into.
// A page change animated while it's going down is given up on by the
// browser (the screen changes size under it), so it's put away first.

const typing = () => {
  const el = document.activeElement;
  return (
    el instanceof HTMLElement &&
    (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) &&
    matchMedia(COARSE).matches
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

// A phone brings its keyboard up only for a field focused within the tap
// itself, so a field that's only there a moment later (in something that
// opens) is out of reach then. Within the tap, a stand-in field takes the
// focus, bringing the keyboard up; the real one takes it over from there
// (`handKeyboardTo`), the keyboard staying up.
let standIn: HTMLInputElement | null = null;

function madeStandIn() {
  const field = Object.assign(document.createElement('input'), {
    type: 'text',
    tabIndex: -1,
    ariaHidden: 'true',
  });
  // Out of sight and in place, where a phone won't scroll to bring it in;
  // its text as large as a field's, so a phone doesn't zoom in on it
  Object.assign(field.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '1px',
    height: '1px',
    opacity: '0',
    fontSize: '16px',
    pointerEvents: 'none',
  });
  return field;
}

export function holdKeyboard() {
  if (!matchMedia(COARSE).matches) return;
  standIn ??= madeStandIn();
  document.body.append(standIn);
  standIn.focus({ preventScroll: true });
}

// Whether the stand-in's holding the keyboard now
export const keyboardHeld = () =>
  Boolean(standIn?.isConnected) && document.activeElement === standIn;

// The real field takes the keyboard over from the stand-in, if it was
// holding it (`held`), and the stand-in goes
export function handKeyboardTo(
  field: HTMLElement | null | undefined,
  held: boolean,
) {
  if (held) field?.focus({ preventScroll: true });
  standIn?.remove();
}
