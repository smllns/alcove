// Read off the disk as the tests run in Node, not bundled
/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// The palettes as theme.css has them, by theme: each colour token's value
const css = readFileSync(new URL('./theme.css', import.meta.url), 'utf8');
const palette = (opening: string) => {
  const from = css.indexOf(opening);
  const block = css.slice(from, css.indexOf('}', from));
  return Object.fromEntries(
    [...block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map(([, k, v]) => [
      k,
      v,
    ]),
  );
};
const themes = {
  light: palette(':root,'),
  dark: palette(":root[data-theme='dark']"),
};

// How far apart two colours are to the eye, as WCAG measures it (1 to 21)
const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// Everything text is set on: the paper from its middle to its edge, the
// sheets laid over it, a notebook's page
const grounds = ['bg-center', 'bg-mid', 'bg-edge', 'surface', 'page'];
// Colours words are written in, small ones included (WCAG AA)
const words = ['ink', 'ink-soft', 'muted', 'faint', 'danger', 'gold-ink'];

describe('the palettes', () => {
  for (const [theme, colours] of Object.entries(themes))
    it(`keep every colour of text readable on every ground (${theme})`, () => {
      for (const word of words)
        for (const ground of grounds)
          expect(
            contrast(colours[word], colours[ground]),
            `${word} on ${ground}`,
          ).toBeGreaterThanOrEqual(4.5);
    });
});
