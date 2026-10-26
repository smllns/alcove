import { fine, type Drawing } from './drawing';

// Plants as an architect draws them: plain outlines, a pot under each.
// One tall and upright, one big, a floor plant with broad leaves.
const pot = (x: number, y: number, w: number, h: number) => (
  <path d={`M${x} ${y}h${w}l-${w * 0.12} ${h}h-${w * 0.76}z`} {...fine} />
);

export const plants = {
  // Tall and upright: long narrow leaves
  tall: {
    box: '0 0 30 68.4',
    width: 20,
    draw: () => (
      <>
        <path d='M15 50C11 36 11 18 14 2C18 18 18 36 15 50z' {...fine} />
        <path d='M15 50C17 40 20 30 26 22C25 34 21 44 15 50z' {...fine} />
        <path d='M15 50C12 42 8 34 3 30C5 40 9 46 15 50z' {...fine} />
        {pot(7, 50, 16, 18)}
      </>
    ),
  },
  // Big, on the floor: stems arching out of a tall pot, each with a broad
  // leaf on it, its rib down the middle
  big: {
    // Wide enough for its leaves, which reach out past its pot
    box: '-12 -3 80 105.4',
    width: 66,
    draw: () => (
      <>
        <path
          d='M28 80C27 62 20 50 11 43M28 80C29 60 34 46 45 37M28 80C28 58 27 38 29 22M28 80C26 70 21 64 14 61'
          {...fine}
        />
        {[
          [11, 43, 205, 1],
          [45, 37, -30, 1],
          [29, 22, -82, 1.05],
          [14, 61, 170, 0.75],
        ].map(([x, y, turn, size]) => (
          <g
            key={turn}
            transform={`translate(${x} ${y}) rotate(${turn}) scale(${size})`}
          >
            <path d='M0 0C4-9 18-10 24 0C18 9 4 9 0 0z' {...fine} />
            <path d='M2 0h19' {...fine} strokeWidth='0.6' />
          </g>
        ))}
        {pot(17, 80, 22, 22)}
      </>
    ),
  },
} satisfies Record<string, Drawing>;
