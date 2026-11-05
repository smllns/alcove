import type { BookFormat } from './books.js';

// A printing as alcove knows it, one for every reader, by its ISBN (as
// ISBN-13): what Open Library says of it, or, where it doesn't know it,
// what readers adding it said. Only what's printed in a book, never
// anything of a reader's own (notes, stars, where it is, who has it).
export type CatalogueEditionDoc = {
  _id: string;
  title: string;
  subtitle?: string;
  authors: string[];
  publisher?: string;
  publishedYear?: number;
  firstPublishedYear?: number;
  pages?: number;
  format?: BookFormat;
  language?: string;
  // Open Library's cover and work, when it knows the book
  coverUrl?: string;
  workKey?: string;
  // Whether Open Library itself knows this printing: its details then
  // stand over readers', which only fill in what's missing
  fromOpenLibrary: boolean;
  // How many times readers have added a copy of it
  added: number;
  createdAt: Date;
  updatedAt: Date;
};
