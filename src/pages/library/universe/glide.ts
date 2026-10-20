import type { Camera } from './camera';

export const GLIDE_MS = 480;

export const easeOut = (t: number) => 1 - (1 - t) ** 3;

// The camera part of the way (`t`, 0 to 1) from `from` to `to`. The zoom
// changes by a steady ratio, so zooming in feels as even as zooming out,
// and the point of the sky in the middle of the screen slides straight
// across, so nothing swings about on the way.
export function between(
  from: Camera,
  to: Camera,
  t: number,
  box: { width: number; height: number },
): Camera {
  const cx = box.width / 2;
  const cy = box.height / 2;
  const zoom = from.zoom * (to.zoom / from.zoom) ** t;
  const fromX = (cx - from.x) / from.zoom;
  const fromY = (cy - from.y) / from.zoom;
  const toX = (cx - to.x) / to.zoom;
  const toY = (cy - to.y) / to.zoom;
  return {
    zoom,
    x: cx - (fromX + (toX - fromX) * t) * zoom,
    y: cy - (fromY + (toY - fromY) * t) * zoom,
  };
}
