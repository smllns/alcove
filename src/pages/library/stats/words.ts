// Numbers and measures as the stats' sentences say them

const WORDS = [
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
];

// A number in words, up to ten; past that, in figures
export const inWords = (n: number) => WORDS[n - 1] ?? n.toLocaleString('en');

// How tall a stack is, in metres or, short of one, in centimetres
export const tallness = (metres: number) =>
  metres < 1
    ? `${Math.round(metres * 100)} centimetres`
    : `${metres.toFixed(1)} metres`;
