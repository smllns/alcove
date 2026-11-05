import type { Book } from '@/entities/book/types';

// The most books a pile is drawn with; past that, the rest aren't drawn
const TALLEST = 40;

// The books of a pile as it's drawn: one for each book, as many as it
// holds up to TALLEST
export const drawnOf = (books: Book[]) => books.slice(0, TALLEST);

// How wide a row of piles may grow, `count` piles wide: no pile wider than
// a few books are long, so a lone one isn't drawn across the page
export const pilesWidth = (count: number) => `${count * 7}rem`;
