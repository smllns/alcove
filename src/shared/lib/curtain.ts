import { gsap } from 'gsap';
import { nextPaint } from './frames';
import { reducedMotionNow } from './motion';

let running = false;

// Waits until the browser is drawing smooth frames again (a fresh page may be
// compiling shaders or painting textures), so the lift itself doesn't stutter
async function untilSmooth(maxMs = 1500) {
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

// A paper curtain drops from the top and covers the page, `change` swaps what's
// behind it, then the curtain lifts away like the preloader does on first visit.
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
  mark.className = 'font-serif text-3xl tracking-[-0.04em]';
  mark.innerHTML = 'alcove<span class="text-accent">.</span>';
  curtain.append(mark);
  document.body.append(curtain);

  try {
    // Soft sine easing both ways: no snap at the start or the end
    await gsap
      .timeline({ defaults: { ease: 'sine.inOut' } })
      .fromTo(curtain, { yPercent: -100 }, { yPercent: 0, duration: 0.8 })
      .fromTo(
        mark,
        { opacity: 0, y: -8 },
        { opacity: 1, y: 0, duration: 0.45 },
        '-=0.4',
      );

    await change();
    await nextPaint();
    await untilSmooth();

    await gsap
      .timeline({ defaults: { ease: 'sine.inOut' } })
      .to(mark, { opacity: 0, y: -8, duration: 0.35 })
      .to(curtain, { yPercent: -100, duration: 1.05 }, '<0.1');
  } finally {
    curtain.remove();
    running = false;
  }
}
