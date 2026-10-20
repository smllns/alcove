import {
  useCallback,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { fitted, MIN_ZOOM, zoomedAt, type Camera } from './camera';
import { between, easeOut, GLIDE_MS } from './glide';
import type { Bounds } from './layout';
import { useSkyGestures } from './useSkyGestures';

// How wide a typical cover should look at the start, at the least. A big
// library opens on the heart of its galaxy at this size rather than
// shrinking every book to a speck; the rest is a drag away.
const READABLE_WIDTH = 36;
// Drawing back out to the whole sky once a search is cleared takes its
// time, an unhurried pull back rather than a jump
const UNFOCUS_GLIDE_MS = 1000;
// How far an arrow key moves the sky, in screen pixels
const KEY_STEP = 80;

// Where the sky is looked at from, and every way of moving it. Until the
// reader moves it themselves, it keeps every book in view as more of them
// load. Given `focus` (the part of the sky a search found), it glides
// there, and back to the whole sky once the search is cleared.
export function useSkyCamera(
  sky: React.RefObject<HTMLDivElement | null>,
  { bounds, typicalWidth }: { bounds: Bounds; typicalWidth: number },
  focus: Bounds | null = null,
  // Where the free sky starts, below whatever floats over its top
  insetTop = 0,
) {
  // The start: everything, unless that would make the books too small
  const readable = typicalWidth ? READABLE_WIDTH / typicalWidth : MIN_ZOOM;
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, zoom: 1 });
  // Whether the camera has been fitted yet: until then nothing is shown, so
  // the books never flash where an unfitted camera would put them
  const [placed, setPlaced] = useState(false);
  const touched = useRef(false);

  // Gliding to a camera, for the buttons and keys: the frame in flight, and
  // where it's headed (so a second click carries on from there)
  const frame = useRef(0);
  const goal = useRef<Camera | null>(null);
  const latest = useRef(camera);
  useEffect(() => {
    latest.current = camera;
  }, [camera]);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const stopGliding = useCallback(() => {
    cancelAnimationFrame(frame.current);
    goal.current = null;
  }, []);

  const glideTo = (target: Camera, duration = GLIDE_MS) => {
    const box = sky.current?.getBoundingClientRect();
    stopGliding();
    // Without motion, it's there on the next frame, like any other glide
    if (!box || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      frame.current = requestAnimationFrame(() => setCamera(target));
      return;
    }
    goal.current = target;
    const from = latest.current;
    const began = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - began) / duration, 1);
      setCamera(between(from, target, easeOut(t), box));
      if (t < 1) frame.current = requestAnimationFrame(step);
      else goal.current = null;
    };
    frame.current = requestAnimationFrame(step);
  };

  // Everything in view and centred, as more books load or the window
  // changes size, until the reader moves it themselves. Before the first
  // paint, so the sky first appears already in place.
  useLayoutEffect(() => {
    const el = sky.current;
    if (!el) return;
    const refit = () => {
      if (!touched.current)
        setCamera(
          fitted(el.getBoundingClientRect(), insetTop, bounds, readable),
        );
      setPlaced(true);
    };
    refit();
    const observer = new ResizeObserver(refit);
    observer.observe(el);
    return () => observer.disconnect();
  }, [sky, bounds, readable, insetTop]);

  // Straight away, for hands on the sky: they move it, and nothing else does
  const zoomAt = useCallback(
    (px: number, py: number, factor: number) => {
      touched.current = true;
      stopGliding();
      setCamera((c) => zoomedAt(c, px, py, factor));
    },
    [stopGliding],
  );
  const pan = useCallback(
    (dx: number, dy: number) => {
      touched.current = true;
      stopGliding();
      setCamera((c) => ({ ...c, x: c.x + dx, y: c.y + dy }));
    },
    [stopGliding],
  );
  const gestures = useSkyGestures(sky, { pan, zoomAt, onGrab: stopGliding });

  // Zooming around the middle, gliding, for the buttons and the keyboard
  const zoomBy = (factor: number) => {
    const box = sky.current?.getBoundingClientRect();
    if (!box) return;
    touched.current = true;
    const from = goal.current ?? latest.current;
    glideTo(zoomedAt(from, box.width / 2, box.height / 2, factor));
  };

  // A search's finds in view; once it's cleared, the whole sky again
  const focusKey = focus
    ? [focus.minX, focus.minY, focus.maxX, focus.maxY].map(Math.round).join()
    : '';
  const wasFocused = useRef(false);
  const onFocusChange = useEffectEvent(() => {
    const box = sky.current?.getBoundingClientRect();
    if (!box) return;
    if (focus) {
      touched.current = true;
      glideTo(fitted(box, insetTop, focus));
    } else if (wasFocused.current) {
      touched.current = false;
      glideTo(fitted(box, insetTop, bounds, readable), UNFOCUS_GLIDE_MS);
    }
    wasFocused.current = Boolean(focus);
  });
  useEffect(() => onFocusChange(), [focusKey]);

  // Every book in view, however small that makes them
  const fit = () => {
    touched.current = false;
    const box = sky.current?.getBoundingClientRect();
    if (box) glideTo(fitted(box, insetTop, bounds));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const moves: Record<string, () => void> = {
      ArrowLeft: () => pan(KEY_STEP, 0),
      ArrowRight: () => pan(-KEY_STEP, 0),
      ArrowUp: () => pan(0, KEY_STEP),
      ArrowDown: () => pan(0, -KEY_STEP),
      '+': () => zoomBy(1.25),
      '=': () => zoomBy(1.25),
      '-': () => zoomBy(0.8),
      '0': fit,
    };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    move();
  };

  return {
    camera,
    placed,
    dragging: gestures.dragging,
    fit,
    zoomIn: () => zoomBy(1.3),
    zoomOut: () => zoomBy(1 / 1.3),
    handlers: { ...gestures.handlers, onKeyDown },
  };
}
