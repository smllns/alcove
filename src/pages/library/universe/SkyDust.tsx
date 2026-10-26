import { cn } from '@/shared/lib/cn';

// How much slower the dust moves than the books, for a sense of depth
const DUST_DEPTH = 0.35;

// One repeating pattern of the sky's dust: its look (a class in
// universe.css, or `marks`, given here), the size of its tile, how fast it
// moves against the rest of the dust (the further, the slower), and where
// its tiles start. Odd, unrelated sizes and offsets, so the layers never
// line up into a visible grid.
type Layer = {
  look?: string;
  tile: [number, number];
  speed: number;
  offset: [number, number];
  // A picture of a tile, in either theme's ink, as --marks-light and
  // --marks-dark
  marks?: Record<string, string>;
};

// The sky's own stars, marked as a star chart marks them: a fine cross,
// its arms as long as the star is bright. Where each is in its tile and
// how long its arms are; drawn as a picture of the whole tile, in the
// ink of either theme (a picture can't take the page's colours), so the
// layer shows the one for the theme (universe.css).
type Star = [x: number, y: number, arm: number];
const INK = { light: 'rgb(41 40 32)', dark: 'rgb(227 219 207)' };
const charted = ([w, h]: [number, number], stars: Star[]) =>
  Object.fromEntries(
    Object.entries(INK).map(([theme, ink]) => {
      const marks = stars
        .map(
          ([x, y, arm]) =>
            `M${x - arm} ${y}h${2 * arm}M${x} ${y - arm}v${2 * arm}`,
        )
        .join('');
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'><path d='${marks}' stroke='${ink}' stroke-opacity='0.55' stroke-width='0.9'/></svg>`;
      return [
        `--marks-${theme}`,
        `url("data:image/svg+xml,${encodeURIComponent(svg)}")`,
      ];
    }),
  );

const DUST: Layer[] = [
  { look: 'sky-speck-l', tile: [173, 191], speed: 1, offset: [0, 0] },
  { look: 'sky-speck-m', tile: [97, 83], speed: 0.6, offset: [37, 11] },
  { look: 'sky-speck-s', tile: [131, 59], speed: 0.45, offset: [71, 29] },
];
// The stars, few and far between, in two layers moving at their own
// speeds
const STARS: Layer[] = [
  {
    tile: [443, 367],
    speed: 0.8,
    offset: [41, 97],
    marks: charted(
      [443, 367],
      [
        [62, 80, 3.5],
        [301, 214, 2.5],
      ],
    ),
  },
  {
    tile: [571, 487],
    speed: 0.5,
    offset: [170, 23],
    marks: charted(
      [571, 487],
      [
        [196, 92, 2.5],
        [470, 361, 3],
        [88, 402, 2],
      ],
    ),
  },
];

// How far a layer one tile larger than the sky is moved, so that it looks
// moved by `by`: never more than a tile, which looks the same as any
// number of them
const shifted = (by: number, tile: number) =>
  (((by % tile) + tile) % tile) - tile;

function Tiles({ layers, x, y }: { layers: Layer[]; x: number; y: number }) {
  return layers.map(
    ({ look, tile: [w, h], speed, offset: [ox, oy], marks }, i) => {
      const depth = DUST_DEPTH * speed;
      return (
        <div
          // The layers never change
          key={i}
          className={cn('sky-tiles', look)}
          style={{
            ...marks,
            width: `calc(100% + ${w}px)`,
            height: `calc(100% + ${h}px)`,
            backgroundSize: `${w}px ${h}px`,
            backgroundPosition: `${ox}px ${oy}px`,
            transform: `translate3d(${shifted(x * depth, w)}px, ${shifted(y * depth, h)}px, 0)`,
          }}
        />
      );
    },
  );
}

// The sky's dust and its stars, panned with the
// camera at `x`, `y`, slower than the books. Each pattern is drawn once,
// on a layer of its own a tile larger than the sky, and only ever slid
// about as the sky moves: drawn afresh at every move instead (by its
// background's position), the whole screen was painted again each frame,
// which Safari does on the processor.
export function SkyDust({ x, y }: { x: number; y: number }) {
  return (
    <>
      <div aria-hidden className='sky-dust'>
        <Tiles layers={DUST} x={x} y={y} />
      </div>
      <div aria-hidden className='sky-glints'>
        <Tiles layers={STARS} x={x} y={y} />
      </div>
    </>
  );
}
