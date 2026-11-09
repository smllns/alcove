import { nextPaint } from './frames';
import { reducedMotionNow, wait } from './motion';
import { fade, slide, untilSmooth } from './curtain';
import { pageTurning } from './pageTurn';
import { settleUntil } from './settleEntrances';

// One of the library's heavier sections (the shelves, the stats), chosen
// from the tabs: a sheet of the page's paper drops over the page at once,
// under the header and the tabs (their shading gliding over to the section
// chosen as it drops); the section is built behind it, a spinner coming
// up on it; and once it's there and the browser's drawing smoothly again,
// the sheet lifts off it, whole, nothing still rising into place. So
// nothing waits on the click, and nothing heavy happens while anything
// moves.

const DROP_MS = 550;
const LIFT_MS = 900;
// As the tabs' shading glides (LibraryNav)
const EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';
// How long the spinner takes to come up once the page is covered, and the
// longest the sheet waits before it lifts anyway, whatever's still loading
const SPIN_IN_MS = 250;
const MOST_MS = 8000;
const DECODE_MS = 1500;
// How long nothing may be coming before the section counts as there, and
// how often that's looked at
const QUIET_MS = 300;
const LOOK_MS = 100;

// The newest change asked for while the sheet's still on its way down, the
// one made behind it
let pending: (() => unknown) | null = null;
let target = '';

// Whether some part of the page is still coming: a spinner up (not the
// sheet's own), or a picture in view not in yet
const inView = (el: Element) => {
  const { top, bottom, left, right } = el.getBoundingClientRect();
  return bottom > 0 && top < innerHeight && right > 0 && left < innerWidth;
};
const picturesInView = () =>
  Array.from(document.querySelectorAll<HTMLImageElement>('main img')).filter(
    inView,
  );
// A spinner up and turning in view: not one kept hidden in a button or a
// card till it's wanted
const spinning = (spinner: Element) =>
  !spinner.closest('[data-curtain]') &&
  inView(spinner) &&
  (spinner.checkVisibility?.({
    opacityProperty: true,
    visibilityProperty: true,
  }) ??
    true);
const loading = () =>
  Array.from(document.querySelectorAll('main .soft-ring')).some(spinning) ||
  picturesInView().some((img) => !img.complete);

// The pictures in view made ready to draw, not only fetched: Chrome turns
// a picture into something to draw only once it's first to be seen, and
// the covers came in a moment after the sheet had lifted. No longer than
// DECODE_MS.
const decoded = () =>
  Promise.race([
    Promise.all(picturesInView().map((img) => img.decode().catch(() => {}))),
    wait(DECODE_MS),
  ]);

// Once the page is at `path` and everything on it has come, and stayed
// so for QUIET_MS (a section may put up its pictures or a spinner a moment
// after it's there), the pictures in view made ready to draw and the
// browser drawing smoothly again; or once it's been MOST_MS
async function untilReady(path: string) {
  const start = performance.now();
  const late = () => performance.now() - start > MOST_MS;
  for (;;) {
    let quiet = 0;
    while (quiet < QUIET_MS && !late()) {
      await wait(LOOK_MS);
      quiet = location.pathname === path && !loading() ? quiet + LOOK_MS : 0;
    }
    await decoded();
    await nextPaint();
    await untilSmooth();
    // Something more come up meanwhile: waited for too
    if (late() || !loading()) return;
  }
}

// `change` made behind it, taking the page to `path`
export async function runSectionCurtain(change: () => unknown, path: string) {
  if (pending) {
    pending = change;
    target = path;
    return;
  }
  if (reducedMotionNow()) {
    await change();
    return;
  }
  pending = change;
  target = path;
  const root = document.documentElement;
  root.dataset.curtain = '';

  const sheet = document.createElement('div');
  sheet.setAttribute('aria-hidden', 'true');
  sheet.dataset.curtain = '';
  // Kept from settling with the page's own (settleEntrances)
  sheet.dataset.movesAlong = '';
  // A hair short of opaque: Chrome draws nothing it can't see, and the
  // section, left undrawn under a solid sheet, was drawn a strip at a time
  // as the sheet lifted off it, in jerks
  sheet.className =
    'section-curtain bg-paper fixed inset-0 grid place-items-center text-muted opacity-[0.999] shadow-[0_30px_60px_-20px_rgba(40,28,14,0.25)]';
  // As Spinner draws it, a size up
  const spinner = document.createElement('span');
  spinner.className = 'soft-ring text-2xl opacity-0';
  sheet.append(spinner);
  document.body.append(sheet);

  let lifted = () => {};
  const done = new Promise<void>((resolve) => (lifted = resolve));
  try {
    const drop = slide(sheet, true, DROP_MS, EASE);
    // For the tabs' shading to glide as it drops, and what waits for the
    // page to have turned, till it's lifted
    pageTurning(done, drop.ready);
    await drop.finished;
    const made = pending;
    pending = null;
    const spin = fade(spinner, true, SPIN_IN_MS);
    await made();
    await nextPaint();
    settleUntil(done);
    await untilReady(target);
    // Gone softly, if it came
    const came = Number(getComputedStyle(spinner).opacity) > 0;
    spin.cancel();
    if (came) fade(spinner, false, 250);
    await slide(sheet, false, LIFT_MS, EASE).finished;
  } finally {
    pending = null;
    sheet.remove();
    delete root.dataset.curtain;
    lifted();
  }
}
