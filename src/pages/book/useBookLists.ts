import { useState } from 'react';
import { workOfBook } from '@/entities/book/catalogueBook';
import { useEditBook } from '@/entities/book/queries';
import type { Book } from '@/entities/book/types';
import { useChangeListWorks, useLists } from '@/entities/list/queries';

// The lists a book is in, changed: a copy of the reader's says which
// it's in itself, kept as it's being saved and till the book's asked
// afresh, so the button never shows it as it was meanwhile; a book from
// the catalogue is kept in the lists themselves, changed in them at once
export function useBookLists(book: Book) {
  const { save, error } = useEditBook(book);
  const [kept, setKept] = useState<string[] | null>(null);
  const work = workOfBook(book);
  const lists = useLists().data?.lists ?? [];
  const changeWorks = useChangeListWorks();
  if (work) {
    const holding = lists
      .filter((list) => list.works?.some((w) => w.workKey === work.workKey))
      .map((list) => list.id);
    return {
      value: holding,
      error: changeWorks.error?.message ?? null,
      change: (next: string[]) => {
        for (const id of next.filter((id) => !holding.includes(id)))
          changeWorks.mutate({ id, add: [work] });
        for (const id of holding.filter((id) => !next.includes(id)))
          changeWorks.mutate({ id, remove: [work.workKey] });
      },
    };
  }
  const saved = book.lists ?? [];
  // Not saved: as the book is again
  if (kept && error) setKept(null);
  // Caught up: the book as asked afresh says what was chosen
  if (
    kept &&
    kept.length === saved.length &&
    kept.every((id) => saved.includes(id))
  )
    setKept(null);
  return {
    value: kept ?? saved,
    error: error ?? null,
    change: (next: string[]) => {
      setKept(next);
      save({ lists: next });
    },
  };
}
