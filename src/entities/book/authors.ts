import type { CatalogueAuthor } from './types';

// Who a book is by, for telling which books share an author: the first
// author's name without case, accents, spaces or punctuation, so "J.R.R.
// Tolkien" and "J. R. R. Tolkien" are one and the same. Empty for a book
// with no author named. Must match how the server finds a writer's books
// (server/src/books/repository.ts writerKey).
export const authorKey = (authors: string[]) =>
  (authors[0] ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '');

// When a writer lived: "1891–1960", "Born 1971", or nothing known
export const lifespan = (author: CatalogueAuthor | null | undefined) =>
  author?.born && author.died
    ? `${author.born}–${author.died}`
    : author?.born
      ? `Born ${author.born}`
      : undefined;
