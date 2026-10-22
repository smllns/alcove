// A CSS cubic-bezier() as a function of time (0 to 1), for motion driven
// frame by frame that should look like one eased by CSS
export function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const at = (a: number, b: number, t: number) =>
    3 * a * t * (1 - t) ** 2 + 3 * b * t ** 2 * (1 - t) + t ** 3;
  return (x: number) => {
    // The point along the curve that's at time x, by halving
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 20; i++) {
      const mid = (lo + hi) / 2;
      if (at(x1, x2, mid) < x) lo = mid;
      else hi = mid;
    }
    return at(y1, y2, (lo + hi) / 2);
  };
}

// One of the theme's own curves (theme.css), read the first time it's
// needed, so the two never drift apart: themeEase('--ease-soft')
export function themeEase(name: string) {
  let ease: ((t: number) => number) | undefined;
  return (t: number) => {
    if (!ease) {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .match(/cubic-bezier\(([^)]+)\)/)?.[1]
        .split(',')
        .map(Number);
      ease =
        value?.length === 4
          ? cubicBezier(...(value as [number, number, number, number]))
          : (x) => x;
    }
    return ease(t);
  };
}
