import { wikiLanguage } from './languages';
import type { Book } from './types';

// What a book's writer is looked up by: the book's work in the catalogue,
// or else their name; its titles, to tell them from others of the same
// name; and the languages the reader read it in and it was written in, for
// the Wikipedia to look in and to tell of them in (as Wikipedia writes
// them: "en", "ru")
export type AuthorAsk = {
  work?: string;
  name?: string;
  title: string;
  originalTitle?: string;
  read?: string;
  original?: string;
};

export const authorAskOf = (book: Book): AuthorAsk => ({
  work: book.openLibrary?.work,
  name: book.authors[0],
  title: book.title,
  originalTitle: book.originalTitle,
  read: wikiLanguage(book.language),
  original: wikiLanguage(book.originalLanguage),
});

// What a writer's page is opened with from a book of theirs: what to look
// them up by, as that book's page did, so they're there at once
export type WriterPageState = { ask: AuthorAsk };
