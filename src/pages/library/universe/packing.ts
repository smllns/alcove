// Keeping stars from landing on one another. Placed stars are filed into a
// coarse grid of cells, so checking a spot only looks at its neighbours,
// not at every book in the sky.

export type Box = { x: number; y: number; halfW: number; halfH: number };

const CELL = 200;

const overlaps = (a: Box, b: Box) =>
  Math.abs(a.x - b.x) < a.halfW + b.halfW &&
  Math.abs(a.y - b.y) < a.halfH + b.halfH;

// One number per cell; the sky would need to be millions of pixels across
// before two cells shared one
const cellKey = (cx: number, cy: number) => cx * 65536 + cy;

export function createPacker() {
  const cells = new Map<number, Box[]>();

  // Calls `visit` with every cell a box touches, until it returns false
  const eachCell = (box: Box, visit: (key: number) => boolean) => {
    const x0 = Math.floor((box.x - box.halfW) / CELL);
    const x1 = Math.floor((box.x + box.halfW) / CELL);
    const y0 = Math.floor((box.y - box.halfH) / CELL);
    const y1 = Math.floor((box.y + box.halfH) / CELL);
    for (let cx = x0; cx <= x1; cx++)
      for (let cy = y0; cy <= y1; cy++)
        if (!visit(cellKey(cx, cy))) return false;
    return true;
  };

  return {
    fits: (box: Box) =>
      eachCell(box, (key) =>
        (cells.get(key) ?? []).every((other) => !overlaps(box, other)),
      ),
    add: (box: Box) => {
      eachCell(box, (key) => {
        const list = cells.get(key);
        if (list) list.push(box);
        else cells.set(key, [box]);
        return true;
      });
    },
  };
}
