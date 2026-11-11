// Read off the disk as the tests run in Node, not bundled
/// <reference types="node" />
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Every source file of the app, with its lines
const src = new URL('..', import.meta.url);
const files = (readdirSync(src, { recursive: true }) as string[])
  .filter((path) => /\.tsx?$/.test(path) && !path.endsWith('.test.ts'))
  .map((path) => ({
    path,
    lines: readFileSync(new URL(path, src), 'utf8').split('\n'),
  }));

// Each line that sets a size of text in a class, with the size
const sizes = files.flatMap(({ path, lines }) =>
  lines.flatMap((line, i) =>
    [...line.matchAll(/text-\[(\d*\.?\d+)(px|rem)\]/g)].map(
      ([, size, unit]) => ({
        at: `${path}:${i + 1}`,
        px: unit === 'rem' ? Number(size) * 16 : Number(size),
        unit,
        // Drawn in an SVG picture (a <text> just above, or filled, not
        // coloured), in the picture's own units
        drawn:
          /fill-/.test(line) ||
          lines
            .slice(Math.max(0, i - 6), i)
            .some((above) => /<text/.test(above)),
      }),
    ),
  ),
);

describe('the sizes of text', () => {
  it('never go under 12px, as small as text reads', () => {
    const small = sizes.filter((each) => !each.drawn && each.px < 12);
    expect(small.map((each) => each.at)).toEqual([]);
  });

  it('are set in rem, to grow with the size the reader asks of their browser', () => {
    const fixed = sizes.filter((each) => !each.drawn && each.unit === 'px');
    expect(fixed.map((each) => each.at)).toEqual([]);
  });

  // An SVG picture is shown at least a third larger than it's drawn
  // (TitleBlock), or at the screen's own scale with 12 units (SectionNotes)
  it('in the pictures, come to 12px on the screen', () => {
    const small = sizes.filter((each) => each.drawn && each.px < 9);
    expect(small.map((each) => each.at)).toEqual([]);
  });
});
