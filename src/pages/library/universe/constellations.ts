// A writer's books in the sky, drawn together as a constellation: each
// joined to the nearest of the others, the way the lines between the stars
// of a constellation are drawn, so the whole is held by the fewest and
// shortest lines and none of them crosses the group needlessly. The lines
// are drawn by hand, as it were: a soft arc, or a long one gently waving.

export type Point = { x: number; y: number };
// `path`: the line itself, as an SVG path
export type Link = { group: string; path: string };

// Longer than this (sky pixels), a line waves rather than arcs
const WAVE_FROM = 260;

// A number in [0, 1) that's always the same for the same two points, so a
// line bends the same way on every visit
const pairSeed = (a: Point, b: Point) => {
  const n = Math.sin(a.x * 12.9898 + a.y * 4.1414 + b.x * 78.233 + b.y * 3.7);
  return n * 43758.5453 - Math.floor(n * 43758.5453);
};

// The line between two stars: bowed to one side by a little, or across a
// longer way, waving one way and then the other
function curveBetween(from: Point, to: Point) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  // A step at right angles to the line, its side and depth its own
  const t = pairSeed(from, to);
  const side = t < 0.5 ? -1 : 1;
  const bow = length * (0.1 + 0.1 * ((t * 2) % 1)) * side;
  const nx = (-dy / length) * bow;
  const ny = (dx / length) * bow;
  const at = (share: number, away: number) =>
    `${from.x + dx * share + nx * away} ${from.y + dy * share + ny * away}`;
  return length < WAVE_FROM
    ? `M ${from.x} ${from.y} Q ${at(0.5, 1)} ${to.x} ${to.y}`
    : `M ${from.x} ${from.y} C ${at(0.33, 1)} ${at(0.67, -1)} ${to.x} ${to.y}`;
}

const apart = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y);

// The lines joining `points` (one writer's books), shortest first: each
// new line runs from a star already joined to the nearest star that isn't.
// Each star still to join keeps the joined one nearest it, brought up to
// date only against the star just joined.
export function linksBetween(group: string, points: Point[]): Link[] {
  const [first, ...others] = points;
  const rest = others.map((to) => ({
    to,
    from: first,
    distance: apart(first, to),
  }));
  const links: Link[] = [];
  while (rest.length) {
    let nearest = 0;
    for (let i = 1; i < rest.length; i++)
      if (rest[i].distance < rest[nearest].distance) nearest = i;
    const [{ from, to }] = rest.splice(nearest, 1);
    links.push({ group, path: curveBetween(from, to) });
    for (const other of rest) {
      const distance = apart(to, other.to);
      if (distance < other.distance)
        Object.assign(other, { from: to, distance });
    }
  }
  return links;
}
