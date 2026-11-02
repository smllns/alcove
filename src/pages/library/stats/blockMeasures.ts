import { BLOCK_STOREYS, STOREY } from './measured';

// The drawing's measures, in its own units: a metre, where the ground is,
// where the block starts and how wide a flat and the stair are
export const M = 17;
export const G = 400;
export const X = 62;
export const FLAT = 4.2 * M;
export const STAIR = 2.4 * M;
export const WIDE = FLAT * 2 + STAIR;
export const TALL = BLOCK_STOREYS * STOREY * M;
export { WALL } from './drawingKit';
export const [SX, SW] = [X + WIDE + 54, 52];
export const MARKS = SX + SW + 30;
export const SHELF = 0.38 * M;
