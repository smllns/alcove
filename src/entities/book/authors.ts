import type { CatalogueAuthor } from './types';

// When a writer lived: "1891–1960", "Born 1971", or nothing known
export const lifespan = (author: CatalogueAuthor | null | undefined) =>
  author?.born && author.died
    ? `${author.born}–${author.died}`
    : author?.born
      ? `Born ${author.born}`
      : undefined;
