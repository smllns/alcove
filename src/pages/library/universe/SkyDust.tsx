import { cn } from '@/shared/lib/cn';

// How much slower the dust moves than the books, for a sense of depth
const DUST_DEPTH = 0.35;

// One repeating pattern of the sky's dust: its look (a class in
// universe.css, or `image`, given here), the size of its tile, how fast it
// moves against the rest of the dust (the further, the slower), and where
// its tiles start. Odd, unrelated sizes and offsets, so the layers never
// line up into a visible grid.
type Layer = {
  look?: string;
  tile: [number, number];
  speed: number;
  offset: [number, number];
  image?: string;
};

// A star of the sky's own, bigger and brighter than the dust: where it is
// in its tile and its radius. All of one colour (--star in universe.css),
// glowing: a bright middle that softens out into a wide halo, part of the
// picture itself, so drawn once with the rest of the layer.
type Star = [x: number, y: number, radius: number];
const starry = (stars: Star[]) =>
  stars
    .map(
      ([x, y, r]) =>
        `radial-gradient(circle at ${x}px ${y}px, var(--star) ${r}px, color-mix(in oklab, var(--star) 40%, transparent) ${r * 1.7}px, color-mix(in oklab, var(--star) 12%, transparent) ${r * 3}px, transparent ${r * 5}px)`,
    )
    .join(',');

const DUST: Layer[] = [
  { look: 'sky-speck-l', tile: [173, 191], speed: 1, offset: [0, 0] },
  { look: 'sky-speck-m', tile: [97, 83], speed: 0.6, offset: [37, 11] },
  { look: 'sky-speck-s', tile: [131, 59], speed: 0.45, offset: [71, 29] },
];
// The glints, a brighter gold speck in the middle of each tile, share
// their layers with the stars
const GLINTS: Layer[] = [
  {
    tile: [389, 311],
    speed: 0.8,
    offset: [41, 97],
    image: `${starry([
      [48, 62, 1.5],
      [300, 40, 1],
      [352, 250, 1.3],
      [70, 250, 1.2],
    ])}, radial-gradient(circle, var(--glint) 1.4px, transparent 2.4px)`,
  },
  {
    tile: [257, 433],
    speed: 0.5,
    offset: [170, 23],
    image: `${starry([
      [40, 60, 1],
      [210, 130, 1.4],
      [70, 330, 1.2],
    ])}, radial-gradient(circle, var(--glint) 1.1px, transparent 2px)`,
  },
];

// How far a layer one tile larger than the sky is moved, so that it looks
// moved by `by`: never more than a tile, which looks the same as any
// number of them
const shifted = (by: number, tile: number) =>
  (((by % tile) + tile) % tile) - tile;

function Tiles({ layers, x, y }: { layers: Layer[]; x: number; y: number }) {
  return layers.map(
    ({ look, tile: [w, h], speed, offset: [ox, oy], image }, i) => {
      const depth = DUST_DEPTH * speed;
      return (
        <div
          // The layers never change
          key={i}
          className={cn('sky-tiles', look)}
          style={{
            width: `calc(100% + ${w}px)`,
            height: `calc(100% + ${h}px)`,
            backgroundSize: `${w}px ${h}px`,
            backgroundPosition: `${ox}px ${oy}px`,
            backgroundImage: image,
            transform: `translate3d(${shifted(x * depth, w)}px, ${shifted(y * depth, h)}px, 0)`,
          }}
        />
      );
    },
  );
}

// The sky's dust and stars, and its few brighter glints, panned with the
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
        <Tiles layers={GLINTS} x={x} y={y} />
      </div>
    </>
  );
}
