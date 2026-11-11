// A photo placed in a frame to be cut out (a reader's photo): how far it's
// zoomed in, from just covering the frame (1) up to MAX_ZOOM, and where its
// middle sits from the frame's, in the frame's pixels. However it's moved,
// it always covers the whole frame.

export type Placed = { zoom: number; x: number; y: number };
export type Size = { width: number; height: number };

export const MAX_ZOOM = 4;

// As it starts: just covering the frame, in its middle
export const centred: Placed = { zoom: 1, x: 0, y: 0 };

// How many frame pixels one of the photo's pixels is drawn as
export const scaleOf = (photo: Size, frame: Size, zoom: number) =>
  Math.max(frame.width / photo.width, frame.height / photo.height) * zoom;

// Moved back as far as it takes to cover the frame
export function covering(photo: Size, frame: Size, placed: Placed) {
  const zoom = Math.min(MAX_ZOOM, Math.max(1, placed.zoom));
  const scale = scaleOf(photo, frame, zoom);
  const keep = (at: number, side: number, room: number) => {
    const spare = Math.max(0, (side * scale - room) / 2);
    return Math.max(-spare, Math.min(spare, at));
  };
  return {
    zoom,
    x: keep(placed.x, photo.width, frame.width),
    y: keep(placed.y, photo.height, frame.height),
  };
}

// Zoomed to `zoom` around a point of the frame (from its middle), what's
// under that point staying there
export function zoomedAround(
  photo: Size,
  frame: Size,
  placed: Placed,
  zoom: number,
  at = { x: 0, y: 0 },
) {
  const next = Math.min(MAX_ZOOM, Math.max(1, zoom));
  const k = next / placed.zoom;
  return covering(photo, frame, {
    zoom: next,
    x: at.x - (at.x - placed.x) * k,
    y: at.y - (at.y - placed.y) * k,
  });
}

// The part of the photo the frame shows, in the photo's own pixels
export function cropOf(photo: Size, frame: Size, placed: Placed) {
  const scale = scaleOf(photo, frame, placed.zoom);
  const [width, height] = [frame.width / scale, frame.height / scale];
  return {
    x: photo.width / 2 - placed.x / scale - width / 2,
    y: photo.height / 2 - placed.y / scale - height / 2,
    width,
    height,
  };
}
