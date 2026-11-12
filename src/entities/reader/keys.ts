// Where each of what's known of readers is kept in the query cache
export const readerKeys = {
  page: (username: string) => ['reader', username] as const,
  people: (username: string, side: string) =>
    ['reader', username, side] as const,
  asking: ['reader-asking'] as const,
  feed: ['feed'] as const,
  reviews: ['reviews'] as const,
  hearts: (bookId: string) => ['hearts-on-mine', bookId] as const,
};
