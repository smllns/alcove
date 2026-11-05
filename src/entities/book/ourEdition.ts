import type { BookFormat } from './types';

// A printing alcove itself knows (its own catalogue, filled by readers),
// one Open Library doesn't: what's printed in it, by its ISBN. Mirrors
// OurEdition in server/src/catalogue/repository.ts.
export type OurEdition = {
  isbn: string;
  title: string;
  subtitle?: string;
  authors: string[];
  publisher?: string;
  publishedYear?: number;
  firstPublishedYear?: number;
  pages?: number;
  format?: BookFormat;
  language?: string;
  coverUrl?: string;
};
