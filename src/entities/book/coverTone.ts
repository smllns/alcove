import { useEffect, useSyncExternalStore } from 'react';
import { clothFor, sizedCover } from './coverImage';

// The colour a cover mostly is, for a book's spine: worked out once from
// the smallest picture there is, a few at a time, and kept in the browser,
// so a shelf is coloured at once on the next visit. A picture that can't
// be read (no picture, or one the browser won't let us look into) has no
// tone, and the spine its cloth.

const KEY = 'alcove.coverTones';
// Pictures looked into at once, so a full bookcase never holds the page up
const AT_ONCE = 4;

const read = (): [string, string | null][] => {
  try {
    return Object.entries(JSON.parse(localStorage.getItem(KEY) ?? '{}'));
  } catch {
    return [];
  }
};
const tones = new Map<string, string | null>(read());
const listeners = new Set<() => void>();
const waiting: string[] = [];
// Every picture asked about on this visit, waiting, being looked into or done
const asked = new Set<string>();
let looking = 0;
let saving: number | undefined;

const keep = () => {
  window.clearTimeout(saving);
  saving = window.setTimeout(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(tones)));
    } catch {
      // Kept for this visit only
    }
  }, 1000);
};

// The commonest colour in the picture, its near neighbours taken with it:
// counted in coarse steps of colour, the busiest step then averaged
async function toneOf(src: string) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = src;
  await img.decode();
  const [w, h] = [16, 24];
  const canvas = document.createElement('canvas');
  Object.assign(canvas, { width: w, height: h });
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context || img.naturalWidth <= 1) return null;
  context.drawImage(img, 0, 0, w, h);
  const data = context.getImageData(0, 0, w, h).data;
  const steps = new Map<number, [number, number, number, number]>();
  for (let i = 0; i < data.length; i += 4) {
    const step =
      ((data[i] >> 5) << 6) | ((data[i + 1] >> 5) << 3) | (data[i + 2] >> 5);
    const sum = steps.get(step) ?? [0, 0, 0, 0];
    sum[0] += data[i];
    sum[1] += data[i + 1];
    sum[2] += data[i + 2];
    sum[3] += 1;
    steps.set(step, sum);
  }
  const [r, g, b, n] = [...steps.values()].reduce((a, c) =>
    c[3] > a[3] ? c : a,
  );
  const hex = (v: number) =>
    Math.round(v / n)
      .toString(16)
      .padStart(2, '0');
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

const tell = () => listeners.forEach((listener) => listener());

function lookNext() {
  while (looking < AT_ONCE && waiting.length) {
    const src = waiting.shift()!;
    looking++;
    toneOf(src)
      .catch(() => null)
      .then((tone) => {
        tones.set(src, tone);
        keep();
        tell();
      })
      .finally(() => {
        looking--;
        lookNext();
      });
  }
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => void listeners.delete(listener);
};

// A cover's tone, once it's known; asked for, the first time, by showing it
function useCoverTone(url: string | undefined) {
  const src = url && sizedCover(url, 'S');
  const tone = useSyncExternalStore(subscribe, () =>
    src ? tones.get(src) : undefined,
  );
  useEffect(() => {
    if (!src || tones.has(src) || asked.has(src)) return;
    asked.add(src);
    waiting.push(src);
    lookNext();
  }, [src]);
  return tone ?? undefined;
}

// The colour of a book's spine: its cover's, once known, or its cloth's,
// with no picture to go by. Told what to be meanwhile (`pending`), it's
// that while its cover's still being looked into, rather than its cloth.
export function useSpineColour(
  { title, cover }: { title: string; cover?: { url: string } },
  pending?: string,
) {
  const src = cover?.url && sizedCover(cover.url, 'S');
  const tone = useCoverTone(cover?.url);
  if (tone) return tone;
  if (pending && src && !tones.has(src)) return pending;
  return clothFor(title);
}
