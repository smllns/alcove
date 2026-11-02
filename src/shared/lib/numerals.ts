const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

// The `i`th (from 0) in roman numerals, as a book numbers its parts
export const numeral = (i: number) => numerals[i] ?? String(i + 1);
