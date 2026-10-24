import type { Bounds } from './layout';

// How big the sky is on screen, in pixels
export type Size = { width: number; height: number };

// Where the sky is looked at from: the screen position of the sky's origin,
// and the zoom
export type Camera = { x: number; y: number; zoom: number };

export const MIN_ZOOM = 0.2;
const MAX_ZOOM = 3;
// The closest the whole sky is ever fitted: a handful of books fill the
// screen nicely without any one of them turning huge
const MAX_FIT_ZOOM = 1.6;
// Room left around the books when the whole sky is fitted on screen
const FIT_SIDE = 40;
const FIT_ENDS = 48;

const clampZoom = (zoom: number) =>
  Math.min(Math.max(zoom, MIN_ZOOM), MAX_ZOOM);

// `camera` zoomed by `factor`, keeping the point of the sky under (px, py)
// on the screen where it is
export function zoomedAt(
  camera: Camera,
  px: number,
  py: number,
  factor: number,
): Camera {
  const zoom = clampZoom(camera.zoom * factor);
  const k = zoom / camera.zoom;
  return { zoom, x: px - (px - camera.x) * k, y: py - (py - camera.y) * k };
}

// The camera that shows every book centred in the free part of `box`,
// below `insetTop` (where the tabs and the search sit over the sky). With
// `readable`, never further out than that: a library that would only fit
// smaller is shown at that zoom instead, centred on the heart of the
// galaxy, the rest of it past the edges.
export function fitted(
  box: Size,
  insetTop: number,
  bounds: Bounds,
  readable = MIN_ZOOM,
): Camera {
  const width = bounds.maxX - bounds.minX + FIT_SIDE * 2;
  const height = bounds.maxY - bounds.minY;
  const top = Math.min(insetTop, box.height / 2);
  const room = box.height - top - FIT_ENDS * 2;
  const whole = Math.min(box.width / width, room / height, MAX_FIT_ZOOM);
  const zoom = clampZoom(Math.max(whole, readable));
  return {
    zoom,
    x: box.width / 2 - ((bounds.minX + bounds.maxX) / 2) * zoom,
    y: top + FIT_ENDS + room / 2 - ((bounds.minY + bounds.maxY) / 2) * zoom,
  };
}
