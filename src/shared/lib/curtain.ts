import { nextPaint } from './frames';
import { reducedMotionNow } from './motion';

// A sheet of paper over the page, dropping from the top and lifting away
// again, for a page to change behind it. Moved by the browser itself
// (transform, off the main thread), so it glides on even as the page
// behind it is being built.

// Soft both ways: no snap at the start or the end
const SOFT = 'cubic-bezier(0.37, 0, 0.63, 1)';

// Waits until the browser is drawing smooth frames again (a fresh page may be
// compiling shaders or painting textures), so the lift itself doesn't stutter
export async function untilSmooth(maxMs = 1500) {
  const start = performance.now();
  let last = start;
  let smooth = 0;
  while (smooth < 6 && performance.now() - start < maxMs) {
    await new Promise(requestAnimationFrame);
    const now = performance.now();
    smooth = now - last < 25 ? smooth + 1 : 0;
    last = now;
  }
}

// `el` slid down over the page (`down`) or back up out of sight, taking
// `ms`; with `easing`, soft both ways unless said
export const slide = (
  el: HTMLElement,
  down: boolean,
  ms: number,
  easing = SOFT,
) =>
  el.animate(
    {
      transform: down
        ? ['translateY(-100%)', 'none']
        : ['none', 'translateY(-100%)'],
    },
    { duration: ms, easing, fill: 'both' },
  );

// `el` faded in (or out), taking `ms`, after `delay`
export const fade = (el: HTMLElement, shown: boolean, ms: number, delay = 0) =>
  el.animate(
    { opacity: shown ? [0, 1] : [1, 0] },
    { duration: ms, delay, easing: SOFT, fill: 'both' },
  );

let running = false;

// The curtain going home: it drops from the top over the whole page, the
// wordmark coming up on it, `change` swaps what's behind it, then it
// lifts away like the preloader does on first visit
export async function runCurtain(change: () => unknown) {
  if (running) return;
  if (reducedMotionNow()) {
    await change();
    return;
  }
  running = true;

  const curtain = document.createElement('div');
  curtain.setAttribute('aria-hidden', 'true');
  curtain.className =
    'bg-paper fixed inset-0 z-[100] grid place-items-center text-ink shadow-[0_30px_60px_-20px_rgba(40,28,14,0.3)]';
  const mark = document.createElement('span');
  mark.className = 'font-serif text-3xl tracking-[-0.04em] opacity-0';
  mark.innerHTML = 'alcove<span class="text-accent">.</span>';
  curtain.append(mark);
  document.body.append(curtain);

  try {
    const drop = slide(curtain, true, 800);
    fade(mark, true, 450, 400);
    await drop.finished;
    await change();
    await nextPaint();
    await untilSmooth();
    fade(mark, false, 350);
    await slide(curtain, false, 1050).finished;
  } finally {
    curtain.remove();
    running = false;
  }
}
