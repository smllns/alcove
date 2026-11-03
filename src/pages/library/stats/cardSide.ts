// Where a group's card sits over it: from its left edge, its right, or
// centred, so it stays on the page at a row's ends
export type CardSide = 'start' | 'end' | 'middle';

// The side for the `i`th of `count` groups in a row: the first three
// from their left edge, the last three from their right
export const sideAt = (i: number, count: number): CardSide =>
  i < 3 ? 'start' : i > count - 4 ? 'end' : 'middle';
