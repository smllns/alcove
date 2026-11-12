// A piece of alcove's own news, as anyone reads it in their feed. Mirrors
// toPublicNews in server/src/news/repository.ts.
export type News = {
  id: string;
  title: string;
  body: string;
  // A way on: a page of alcove (/…) or the web
  link?: { label: string; to: string };
  at: string;
};

// What's written of it, by one of those who run alcove
export type NewsInput = Pick<News, 'title' | 'body' | 'link'>;
