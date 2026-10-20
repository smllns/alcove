// Books drift and bob, so one can slip out from under a still pointer and
// back; letting go only after this long keeps the cursor from flickering
const LET_GO_MS = 150;

// For each canvas: how many things in it are hovered, and the pending
// let-go, if any
const holds = new WeakMap<HTMLElement, { count: number; timer?: number }>();

// Shows a pointer over `canvas` until the returned function is called (and
// nothing else in it is hovered by then)
export function holdPointer(canvas: HTMLElement) {
  const hold = holds.get(canvas) ?? { count: 0 };
  holds.set(canvas, hold);
  window.clearTimeout(hold.timer);
  hold.count += 1;
  canvas.style.cursor = 'pointer';

  return () => {
    hold.count -= 1;
    if (hold.count > 0) return;
    hold.timer = window.setTimeout(() => {
      if (hold.count === 0) canvas.style.cursor = '';
    }, LET_GO_MS);
  };
}
