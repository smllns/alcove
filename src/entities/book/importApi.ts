import { request } from '@/shared/api/http';
import type { BookInput } from './types';

// Books brought over from another site, a batch at a time (no more than
// IMPORT_BATCH, as the server has it): how many were added, already there,
// or turned away
export const IMPORT_BATCH = 40;
// Added, already there, turned away, and added as they were, not found in
// the catalogue
export type ImportCounts = {
  added: number;
  skipped: number;
  failed: number;
  unfound: number;
};
export const importBooks = (books: BookInput[], importId: string) =>
  request<ImportCounts>('/books/import', {
    method: 'POST',
    body: { books, importId },
  });

// The latest import from another site, if any: which, when, and how many
// of its books are still on the shelves
export type LastImport = { id: string; at: string; books: number };
export const fetchLastImport = async () =>
  (await request<{ last: LastImport | null }>('/books/imports/last')).last;

// An import undone: its books taken off, what it put in the lists out
export const undoImport = (id: string) =>
  request<{ deleted: number; unlisted: number }>(`/books/imports/${id}`, {
    method: 'DELETE',
  });

// Every book taken off the shelves
export const deleteAllBooks = () =>
  request<{ deleted: number }>('/books', { method: 'DELETE' });
