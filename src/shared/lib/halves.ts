// A number in halves, written as people write it: 3.5 → "3½", 0.5 → "½"
export const halves = (value: number) =>
  `${Math.floor(value) || ''}${value % 1 ? '½' : ''}`;
